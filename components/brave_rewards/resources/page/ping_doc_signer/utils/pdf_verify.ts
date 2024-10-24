// Copyright (c) 2024 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import { asn1, pkcs7, pki } from 'node-forge'
import { createVerify, createHash } from 'crypto'
import { PdfVerificationErrorType } from './errorTypes';

// Mapping of error types to error to be shown to users
const ERROR_MESSAGES: { [key in PdfVerificationErrorType]: string } = {
  [PdfVerificationErrorType.INVALID_SIGNATURE]: "The PDF signature is invalid.",
  [PdfVerificationErrorType.INVALID_CONTENT]: "The PDF content does not match the signature.",
  [PdfVerificationErrorType.BYTE_RANGE_NOT_FOUND]: "Unable to locate the signature information in the PDF.",
  [PdfVerificationErrorType.PARSING_ERROR]: "Error parsing the PDF structure.",
  [PdfVerificationErrorType.UNKNOWN_ERROR]: "An unexpected error occurred during PDF verification."
}

// Custom error class
class PdfVerificationError extends Error {
  constructor(public type: PdfVerificationErrorType) {
    super(ERROR_MESSAGES[type]);
    this.name = 'PdfVerificationError';
  }
}

interface SignatureInfo {
  signature: string;
  signedData: Buffer;
}

export interface VerificationResult {
  signatureIndex: number;
  isValid: boolean;
  error?: PdfVerificationError;
}

export const verifyPdf = (pdf: Buffer): VerificationResult[] => {
  try {
    const signatures = getAllSignatures(pdf);
    return signatures.map((sigInfo, index) => {
      try {
        const isValid = verifySingleSignature(sigInfo);
        return { signatureIndex: index + 1, isValid };
      } catch (error) {
        return {
          signatureIndex: index + 1,
          isValid: false,
          error: error instanceof PdfVerificationError ? error : new PdfVerificationError(PdfVerificationErrorType.UNKNOWN_ERROR)
        };
      }
    });
  } catch (error) {
    console.error('Error during PDF verification:', error);
    throw new PdfVerificationError(PdfVerificationErrorType.PARSING_ERROR);
  }
}

const verifySingleSignature = (sigInfo: SignatureInfo): boolean => {
  try {
    const p7Asn1 = asn1.fromDer(sigInfo.signature)
    const message = pkcs7.messageFromAsn1(p7Asn1) as pkcs7.Captured<pkcs7.PkcsSignedData>
    const { signature: sig, digestAlgorithm, authenticatedAttributes: attrs } = message.rawCapture

    const set = asn1.create(asn1.Class.UNIVERSAL, asn1.Type.SET, true, attrs)
    const hashAlgorithmOid = asn1.derToOid(digestAlgorithm)
    const hashAlgorithm = pki.oids[hashAlgorithmOid].toUpperCase()
    const buf = Buffer.from(asn1.toDer(set).data, 'binary')

    const verifier = createVerify(`RSA-${hashAlgorithm}`)
    verifier.update(buf)
    const cert = pki.certificateToPem(message.certificates[0])
    const validAuthenticatedAttributes = verifier.verify(cert, sig, 'binary')

    if (!validAuthenticatedAttributes) {
      throw new PdfVerificationError(PdfVerificationErrorType.INVALID_SIGNATURE)
    }

    const pdfHash = createHash(hashAlgorithm)
    pdfHash.update(sigInfo.signedData)

    const oids = pki.oids
    const fullAttrDigest = attrs.find(
      (attr: any) => asn1.derToOid(attr.value[0].value) === oids.messageDigest
    )
    const attrDigest = fullAttrDigest.value[1].value[0].value
    const dataDigest = pdfHash.digest()
    const validContentDigest = dataDigest.toString('binary') === attrDigest

    if (validContentDigest) {
      return true
    } else {
      throw new PdfVerificationError(PdfVerificationErrorType.INVALID_CONTENT)
    }
  } catch (error) {
    if (error instanceof PdfVerificationError) {
      throw error
    } else {
      console.error('Unexpected error during signature verification:', error)
      throw new PdfVerificationError(PdfVerificationErrorType.UNKNOWN_ERROR)
    }
  }
}

const getAllSignatures = (pdf: Buffer): SignatureInfo[] => {
  const signatures: SignatureInfo[] = [];
  let startIndex = 0;
  let continueLoop = true;

  while (continueLoop) {
    try {
      let byteRangePos = pdf.indexOf('/ByteRange[', startIndex);
      if (byteRangePos === -1) byteRangePos = pdf.indexOf('/ByteRange [', startIndex);
      if (byteRangePos === -1) {
        continueLoop = false;
        break;
      }

      const byteRangeEnd = pdf.indexOf(']', byteRangePos);
      const byteRange = pdf.slice(byteRangePos, byteRangeEnd + 1).toString();
      const byteRangeNumbers = /(\d+) +(\d+) +(\d+) +(\d+)/.exec(byteRange);
      const byteRangeArr = byteRangeNumbers?.[0].split(' ');

      if (!byteRangeArr) {
        throw new PdfVerificationError(PdfVerificationErrorType.BYTE_RANGE_NOT_FOUND);
      }

      const signedData = Buffer.concat([
        pdf.slice(parseInt(byteRangeArr[0]), parseInt(byteRangeArr[1])),
        pdf.slice(
          parseInt(byteRangeArr[2]),
          parseInt(byteRangeArr[2]) + parseInt(byteRangeArr[3])
        )
      ]);

      let signatureHex = pdf
        .slice(
          parseInt(byteRangeArr[0]) + (parseInt(byteRangeArr[1]) + 1),
          parseInt(byteRangeArr[2]) - 1
        )
        .toString('binary');
      signatureHex = signatureHex.replace(/(?:00)*$/, '');
      const signature = Buffer.from(signatureHex, 'hex').toString('binary');

      signatures.push({ signature, signedData });
      startIndex = byteRangeEnd + 1;
    } catch (error) {
      if (error instanceof PdfVerificationError) {
        throw error;
      } else {
        console.error('Error extracting signature from PDF:', error);
        throw new PdfVerificationError(PdfVerificationErrorType.PARSING_ERROR);
      }
    }
  }

  return signatures;
}