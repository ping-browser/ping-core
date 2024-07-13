// Copyright (c) 2024 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

import { pki, asn1, util } from 'node-forge'
import pkcs7 from './lib/pkcs7'
import SignPdfError from './SignPdfError'
import { removeTrailingNewLine, plainAddPlaceholder, DEFAULT_BYTE_RANGE_PLACEHOLDER } from 'node-signpdf'

export const signWithPkcs11 = async (
  pdfBuffer: Buffer,
  hsmPath: string,
  pin: string
) => {
  if (!(pdfBuffer instanceof Buffer)) {
    throw new SignPdfError('PDF expected as Buffer.', SignPdfError.TYPE_INPUT)
  }

  let { pdf, placeholderLength, byteRange } = getSignablePdfBuffer(pdfBuffer)

  let signer: any = {}
  signer.sign = async (md: any) => {
    // https://stackoverflow.com/a/47106124
    const prefix = Buffer.from([
      0x30, 0x31, 0x30, 0x0d, 0x06, 0x09, 0x60, 0x86, 0x48, 0x01, 0x65, 0x03,
      0x04, 0x02, 0x01, 0x05, 0x00, 0x04, 0x20
    ])
    let buf = Buffer.concat([prefix, Buffer.from(md.digest().toHex(), 'hex')])

    const toSign = buf.toString('hex')

    return new Promise((resolve) => {
      ;(chrome as any).pkcs11.getSignature(
        hsmPath,
        pin,
        toSign,
        (sig: string) => {
          console.log('signedHex', sig)
          let signature = Buffer.from(sig, 'hex').toString('binary')
          resolve(signature)
        }
      )
    })
  }

  const p7 = pkcs7.createSignedData()
  // Start off by setting the content.
  p7.content = util.createBuffer(pdf.toString('binary'))

  const certificate = await new Promise((resolve) =>
    (chrome as any).pkcs11.getCertificate(hsmPath, (cert: string) =>
      resolve(pki.certificateFromPem(cert))
    )
  )

  p7.addCertificate(certificate)
  // Add a sha256 signer. That's what Adobe.PPKLite adbe.pkcs7.detached expects.
  p7.addSigner({
    key: signer,
    certificate,
    digestAlgorithm: pki.oids.sha256,
    authenticatedAttributes: [
      {
        type: pki.oids.contentType,
        value: pki.oids.data
      },
      {
        type: pki.oids.messageDigest
        // value will be auto-populated at signing time
      },
      {
        type: pki.oids.signingTime,
        // value can also be auto-populated at signing time
        // We may also support passing this as an option to sign().
        // Would be useful to match the creation time of the document for example.
        value: new Date().toString()
      }
    ]
  })

  await p7.sign({ detached: true })

  let { signedPdf } = embedP7inPdf(pdf, p7, byteRange, placeholderLength)

  console.log('signedPdf')

  return signedPdf
}

const getSignablePdfBuffer = (pdfBuffer: Buffer) => {
  pdfBuffer = plainAddPlaceholder({ pdfBuffer, reason: 'I am the author' })
  let pdf = removeTrailingNewLine(pdfBuffer)

  let byteRangePlaceholderStr = DEFAULT_BYTE_RANGE_PLACEHOLDER
  // Find the ByteRange placeholder.
  const byteRangePlaceholder = [
    0,
    `/${byteRangePlaceholderStr}`,
    `/${byteRangePlaceholderStr}`,
    `/${byteRangePlaceholderStr}`
  ]
  const byteRangeString = `/ByteRange [${byteRangePlaceholder.join(' ')}]`
  const byteRangePos = pdf.indexOf(byteRangeString)
  if (byteRangePos === -1) {
    throw new SignPdfError(
      `Could not find ByteRange placeholder: ${byteRangeString}`,
      SignPdfError.TYPE_PARSE
    )
  }

  // Calculate the actual ByteRange that needs to replace the placeholder.
  const byteRangeEnd = byteRangePos + byteRangeString.length
  const contentsTagPos = pdf.indexOf('/Contents ', byteRangeEnd)
  const placeholderPos = pdf.indexOf('<', contentsTagPos)
  const placeholderEnd = pdf.indexOf('>', placeholderPos)
  const placeholderLengthWithBrackets = placeholderEnd + 1 - placeholderPos
  const placeholderLength = placeholderLengthWithBrackets - 2
  const byteRange = [0, 0, 0, 0]
  byteRange[1] = placeholderPos
  byteRange[2] = byteRange[1] + placeholderLengthWithBrackets
  byteRange[3] = pdf.length - byteRange[2]
  let actualByteRange = `/ByteRange [${byteRange.join(' ')}]`
  actualByteRange += ' '.repeat(byteRangeString.length - actualByteRange.length)

  // Replace the /ByteRange placeholder with the actual ByteRange
  pdf = Buffer.concat([
    pdf.slice(0, byteRangePos),
    Buffer.from(actualByteRange),
    pdf.slice(byteRangeEnd)
  ])

  // Remove the placeholder signature
  pdf = Buffer.concat([
    pdf.slice(0, byteRange[1]),
    pdf.slice(byteRange[2], byteRange[2] + byteRange[3])
  ])

  return { pdf, placeholderLength, byteRange }
}

const embedP7inPdf = (
  pdf: Buffer,
  p7: any,
  byteRange: number[],
  placeholderLength: number
) => {
  // Check if the PDF has a good enough placeholder to fit the signature.
  const raw = asn1.toDer(p7.toAsn1()).getBytes()
  // placeholderLength represents the length of the HEXified symbols but we're
  // checking the actual lengths.
  if (raw.length * 2 > placeholderLength) {
    throw new SignPdfError(
      `Signature exceeds placeholder length: ${
        raw.length * 2
      } > ${placeholderLength}`,
      SignPdfError.TYPE_INPUT
    )
  }

  let signature = Buffer.from(raw, 'binary').toString('hex')
  // Store the HEXified signature. At least useful in tests.
  let hexSignature = signature

  // Pad the signature with zeroes so the it is the same length as the placeholder
  signature += Buffer.from(
    String.fromCharCode(0).repeat(placeholderLength / 2 - raw.length)
  ).toString('hex')

  // Place it in the document.
  let signedPdf = Buffer.concat([
    pdf.slice(0, byteRange[1]),
    Buffer.from(`<${signature}>`),
    pdf.slice(byteRange[1])
  ])

  return { signedPdf, hexSignature }
}
