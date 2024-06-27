/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
// @ts-nocheck
import * as React from 'react'
import * as urls from '../../lib/rewards_urls'
import { useState, useRef, useEffect } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import forge from 'node-forge';
import {plainAddPlaceholder, removeTrailingNewLine} from 'node-signpdf/dist/helpers/index';
import  { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  './pdfjs-dist-worker.js',
  import.meta.url
).toString();

interface Props {
  onEnable?: () => void
}

// =============================================Verifier class=========================================================================
class VerifyPdf {
  lastIndexOf(buffer, sequence) {
    const byteSeq = new TextEncoder().encode(sequence);
    const bufferLength = buffer.byteLength;
    const seqLength = byteSeq.length;

    for (let i = bufferLength - seqLength; i >= 0; i--) {
      let found = true;
      for (let j = 0; j < seqLength; j++) {
        if (new DataView(buffer).getUint8(i + j) !== byteSeq[j]) {
          found = false;
          break;
        }
      }
      if (found) {
        return i;
      }
    }
    return -1;
  }

  convertHexToUint8Array(hex) {
    const bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  uint8ArrayToArrayBuffer(uint8Array) {
    return uint8Array.buffer.slice(uint8Array.byteOffset, uint8Array.byteOffset + uint8Array.byteLength);
  }

  getSignature(pdfBuff) {
    let byteRangePos = this.lastIndexOf(pdfBuff, '/ByteRange[');
    if (byteRangePos === -1) byteRangePos = this.lastIndexOf(pdfBuff, '/ByteRange [');
    if (byteRangePos === -1) {
      throw new Error('Byte range not found in PDF');
    }

    const byteRangeEnd = new TextDecoder().decode(pdfBuff.slice(byteRangePos)).indexOf(']') + byteRangePos;
    if (byteRangeEnd === -1) {
      throw new Error('Byte range end not found in PDF');
    }

    const byteRange = new TextDecoder().decode(pdfBuff.slice(byteRangePos, byteRangeEnd + 1));
    console.log('Byte Range:', byteRange);

    const byteRangeNumbers = /(\d+) +(\d+) +(\d+) +(\d+)/.exec(byteRange);
    if (!byteRangeNumbers) {
      throw new Error('Byte range numbers not found in PDF');
    }

    const byteRangeArr = byteRangeNumbers.slice(1).map(Number);
    if (byteRangeArr.length !== 4) {
      throw new Error('Invalid byte range array');
    }

    console.log('Byte Range Array:', byteRangeArr);

    const signedData = new Uint8Array([
      ...new Uint8Array(pdfBuff.slice(byteRangeArr[0], byteRangeArr[0] + byteRangeArr[1])),
      ...new Uint8Array(pdfBuff.slice(byteRangeArr[2], byteRangeArr[2] + byteRangeArr[3]))
    ]);

    console.log('Signed Data:', Array.from(signedData).map(byte => byte.toString(16).padStart(2, '0')).join(''));

    // Ensure we are correctly slicing the signature part
    const signatureStart = byteRangeArr[0] + byteRangeArr[1] + 1;
    const signatureEnd = byteRangeArr[2] - 1;

    // Validate signature start and end positions
    if (signatureStart >= pdfBuff.byteLength || signatureEnd >= pdfBuff.byteLength) {
      throw new Error('Signature positions are out of bounds');
    }

    let signatureHex = Array.from(new Uint8Array(pdfBuff.slice(signatureStart, signatureEnd)))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
    console.log('Raw Signature Hex:', signatureHex);

    // Clean up the signature hex (remove trailing zeroes)
    signatureHex = signatureHex.replace(/(?:00)*$/, '');

    if (signatureHex.length % 2 !== 0) {
      signatureHex += '0';
    }

    console.log('Cleaned Signature Hex:', signatureHex);

    const signatureBinary = this.convertHexToUint8Array(signatureHex);
    const signatureArrayBuffer = this.uint8ArrayToArrayBuffer(signatureBinary);
    console.log("Signature (Binary):", signatureArrayBuffer);

    return { signature: signatureArrayBuffer, signedData };
  }

  verify(pdfBuff) {
    try {
      console.log('PDF Buffer Length:', pdfBuff.byteLength);

      const extractedData = this.getSignature(pdfBuff);
      console.log("Extracted Data: ", extractedData);
      console.log("Extracted Signature (Hex): ", Array.from(extractedData.signature).map(byte => byte.toString(16).padStart(2, '0')).join(''));

      // extractedData.signature.length = () => {
      //   if (extractedData.signature instanceof ArrayBuffer) {
      //     return extractedData.signature.byteLength;
      //   } else {
      //     throw new Error("extractedData.signature is not an ArrayBuffer");
      //   }
      // }
      
      // let byteIndex = 0;

      // extractedData.signature.getByte = () => {
      //   if (extractedData.signature instanceof ArrayBuffer) {
      //     const byteArray = new Uint8Array(extractedData.signature);
      //     if (byteIndex >= byteArray.length) {
      //       throw new RangeError("End of buffer reached");
      //     }
      //     return byteArray[byteIndex++];
      //   } else {
      //     throw new Error("extractedData.signature is not an ArrayBuffer");
      //   }
      // }

    
      // extractedData.signature.getBytes = (length) => {
      //   if (extractedData.signature instanceof ArrayBuffer) {
      //     const byteArray = new Uint8Array(extractedData.signature);
      //     if (length < 0 || length > byteArray.length) {
      //       throw new RangeError("Invalid length specified");
      //     }
      //     return Array.from(byteArray.slice(0, length));
      //   } else {
      //     throw new Error("extractedData.signature is not an ArrayBuffer");
      //   }
      // }
      
      const passSign = '0\x82\b2\x06\t*\x86H\x86÷\r\x01\x07\x02 \x82\b#0\x82\b\x1F\x02\x01\x011\x0F0\r\x06\t`\x86H\x01e\x03\x04\x02\x01\x05\x000\x0B\x06\t*\x86H\x86÷\r\x01\x07\x01 \x82\x05ç0\x82\x05ã0\x82\x04Ë \x03\x02\x01\x02\x02\x06w=\x8CÚå\x060\r\x06\t*\x86H\x86÷\r\x01\x01\x0B\x05\x000{1\x0B0\t\x06\x03U\x04\x06\x13\x02IN1(0&\x06\x03U\x04\n' +
      '\x13\x1FFuturiQ Systems Private Limited1\x0F0\r\x06\x03U\x04\x0B\x13\x06Sub-CA110/\x06\x03U\x04\x03\x13(SignX sub-CA for Class 3 Individual 20220\x1E\x17\r240115093102Z\x17\r260115093102Z0\x82\x01/1\x0B0\t\x06\x03U\x04\x06\x13\x02IN1\x110\x0F\x06\x03U\x04\n' +
      `\x13\bPersonal1\r0\x0B\x06\x03U\x04\f\x13\x0431891)0'\x06\x03U\x04A\x13 uZoFG0eq3FKYA9VID8GQo4pP57lcKFht1I0G\x06\x03U\x04\x14\x13@7b8793d9358c6e0deeec36ef214412463f516135a9dc072b2f6aec10a2c291131\x0F0\r\x06\x03U\x04\x11\x13\x062010021\x160\x14\x06\x03U\x04\b\x13\rUttar Pradesh1I0G\x06\x03U\x04\x05\x13@553411845cba158e7e4c106153a31bd689b38c91124507e044f3c9d0940301c21\x140\x12\x06\x03U\x04\x03\x13\x0BUday Bansal0\x82\x01"0\r\x06\t*\x86H\x86÷\r\x01\x01\x01\x05\x00\x03\x82\x01\x0F\x000\x82\x01\n` +
      '\x02\x82\x01\x01\x00¶ýCÇê\x1As\x15A+ü=ªV1L\x18\x81æá\x80\x8A !K)Kç&\x80\bñ\x17Ø\x94@ùº\x90\x9E4÷\x88Â\x8A\x9EË¹\x9AUF¡pZ\x9A°ÆP\x9010Ö\x1D(½è8§\\K¥ì?Yü\'\'\x8Dd\x97F\x029\x19\x8A\x9C»Ì\x9AÛF>\x9EP§Dc\x00\x93ð\x86\x06*Îâ\x94væ\x10ùûÊ\x86\x98C{h¯\x16Í{ç.\b¾\x83e\x88\x94>áïÎLÎ^o\x07\x11§ñl\x06K\x03\x92F\x8D\\\x9B\x1DáÃ¬)Cs\x88\x93Zòfÿy¾ÿzV)-\x94`!bK&r:*®r\bÕ\x99.À\x9E\x99)@\x9EÍ\x98³\x8B0T}qÀÇO\bKÙBXÝG\x9C\x0EÙú\x86GM+Î\x94 jB_p)GúxE¦¦m¢G*Åìû8"ÙÝå¦*¶\\|\x87\x12\x96ZÉ¹1±\x02\x03\x01\x00\x01£\x82\x01µ0\x82\x01±0\x13\x06\x03U\x1D#\x04\f0\n' +
      '\x80\b@Jö´ÍçB\x8C0\x11\x06\x03U\x1D\x0E\x04\n' +
      '\x04\bL5DF\x9C÷d\x100\x81\x95\x06\b+\x06\x01\x05\x05\x07\x01\x01\x04\x81\x880\x81\x850H\x06\b+\x06\x01\x05\x05\x070\x02\x86<https://signxca.com/repository/aia/SignXClass3Individual.cer09\x06\b+\x06\x01\x05\x05\x070\x01\x86-http://ocsp.signxca.com/SignXClass3Individual0M\x06\x03U\x1D\x1F\x04F0D0B @ >\x86<https://signxca.com/repository/crl/SignXClass3Individual.crl0\x1D\x06\x03U\x1D \x04\x160\x140\b\x06\x06`\x82dd\x02\x030\b\x06\x06`\x82dd\x02\x020\f\x06\x03U\x1D\x13\x01\x01ÿ\x04\x020\x000@\x06\x03U\x1D%\x04907\x06\b+\x06\x01\x05\x05\x07\x03\x02\x06\b+\x06\x01\x05\x05\x07\x03\x04\x06\t*\x86H\x86÷/\x01\x01\x05\x06\n' +
      '+\x06\x01\x04\x01\x827\n' +
      '\x03\f\x06\n' +
      '+\x06\x01\x04\x01\x827\x14\x02\x020!\x06\x03U\x1D\x11\x04\x1A0\x18\x81\x16udaybansal19@gmail.com0\x0E\x06\x03U\x1D\x0F\x01\x01ÿ\x04\x04\x03\x02\x06À0\r\x06\t*\x86H\x86÷\r\x01\x01\x0B\x05\x00\x03\x82\x01\x01\x00z\x02Æ¯QK\x94v\x19å¡¶¸\x17Î\x13Mºÿ\x87\x1Bê\x11å««£\x10¹ÝaÄÌúü,\x81,ºÃâk\x8Eÿ\x14Ï°½N-½Âæÿ¡"\x0EékºX(\x1BÁµ.õ´yl\x1A0+H×õÖcÑëU6W\x8DýSi\n' +
      '\r}êòö¬Ü4ÕÇ\x9CÜ[ÐÓz5©Ù·¹Xi\x10Wd\x1A±Å\x9E\x87\x1FÉvHwKÀ\x96ø\x8Bù\x07\x14\x16Ýa\x9Abl\x98\x03\x195Ð\x9C;Å\x96?!J½¼õ\x12¾\x16#â\x0E=\x03\x18Y/\x04Ú\n' +
      `ë\x9C'¥7?±T\x88ëÅæ\x864\x10ßjÙ\x0675¼!uw\x07ñª\x89aÆ¶"Eø²F8\x06 .v\n` +
      "â?'«\x98º¬$ä)¿54\x16ù\x03H\x07\x86\fôv\x9D\x96Y»#\\H\x1Cz¤À-.M/\x14\x81ü\x8EÎâ\x8DÞ=1\x82\x02\x0F0\x82\x02\x0B\x02\x01\x010\x81\x850{1\x0B0\t\x06\x03U\x04\x06\x13\x02IN1(0&\x06\x03U\x04\n" +
      '\x13\x1FFuturiQ Systems Private Limited1\x0F0\r\x06\x03U\x04\x0B\x13\x06Sub-CA110/\x06\x03U\x04\x03\x13(SignX sub-CA for Class 3 Individual 2022\x02\x06w=\x8CÚå\x060\r\x06\t`\x86H\x01e\x03\x04\x02\x01\x05\x00 \\0\x0F\x06\t*\x86H\x86÷/\x01\x01\b1\x020\x000\x18\x06\t*\x86H\x86÷\r\x01\t\x031\x0B\x06\t*\x86H\x86÷\r\x01\x07\x010/\x06\t*\x86H\x86÷\r\x01\t\x041"\x04 \x15\x14E\x9C\x9F\x85S>Ó\x88\x84nºÒò\x81\x04\x0E\x14\x8Bâ¹¸\x14MYõw¢ÿu30\r\x06\t*\x86H\x86÷\r\x01\x01\x0B\x05\x00\x04\x82\x01\x00Iü\x16\x1DÔ4¥\x91ú\x14-\x8Dô¼I±X/@à«\x05\x1C¨\x8AOS\x85ü¯\x8Aç\x8DyA9íw\x10ì\x00\x16×8+Y)\x94CÆilc\x03Î\bï ßI6\n' +
      '\x05LW=(r\x1Fì ;\x9F+}u\x95×\x1F³:º¯\x0F\x86%z\x8DÛ\x86#\x14\x95Öþ¥+\x9BRâý¼¾Ì1\x8A²\x9B\x18vT·ØÒ\x9E*þ\x0BRÀ\x05ª\x1D\fq¦fQë¬[D\x80ËÐÈH>\x9Cßë9\x9Al\x96½\r×\x87 ð\x93Ê|\x96U\x9Aã\x14£ZµÑ÷Pi\r\x95Ç8\x9E\x98\\Æ\x12!\x8AJb¹@YEìA"ô)\\Kb@\x1EÃ$\x96Ê|\x0FÍ4\x9A\x06\x91\x01\x88¼M|6\x9EÊMXåc¥¾\x01Wü\x89¹(&á\x8DÒÅñd3*\x14l£±&º\x8D\\\x190x]µî)¸#Û]4\x96«¦';

      const p7Asn1 = forge.asn1.fromDer(passSign);
      console.log('ASN.1 Structure:', p7Asn1);

      const message = forge.pkcs7.messageFromAsn1(p7Asn1);
      console.log('PKCS7 Message:', message);

      const { signature: sig, digestAlgorithm, authenticatedAttributes: attrs } = message.rawCapture;
      console.log('Signature (Raw):', sig.toString('hex'));
      console.log('Digest Algorithm:', digestAlgorithm);
      console.log('Authenticated Attributes:', attrs);

      const set = forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.SET,
        true,
        attrs
      );

      const hashAlgorithmOid = forge.asn1.derToOid(digestAlgorithm);
      const hashAlgorithm = forge.pki.oids[hashAlgorithmOid].toUpperCase();
      console.log('Hash Algorithm:', hashAlgorithm);

      const buf = new Uint8Array(forge.asn1.toDer(set).getBytes().split('').map(char => char.charCodeAt(0)));
      console.log('ASN.1 Set DER:', Array.from(buf).map(byte => byte.toString(16).padStart(2, '0')).join(''));

      const verifier = crypto.createVerify(`RSA-${hashAlgorithm}`);
      verifier.update(buf);

      const cert = forge.pki.certificateToPem(message.certificates[0]);
      console.log('Certificate:', cert);

      const validAuthenticatedAttributes = verifier.verify(cert, sig, 'binary');
      console.log('Valid Authenticated Attributes:', validAuthenticatedAttributes);

      if (!validAuthenticatedAttributes) {
        throw new Error('Wrong authenticated attributes');
      }

      const pdfHash = crypto.createHash(hashAlgorithm);
      const data = extractedData.signedData;
      pdfHash.update(data);

      const oids = forge.pki.oids;
      const fullAttrDigest = attrs.find(
        (attr) => forge.asn1.derToOid(attr.value[0].value) === oids.messageDigest
      );
      console.log('Full Attribute Digest:', fullAttrDigest);

      const attrDigest = fullAttrDigest.value[1].value;
      const computedDigest = pdfHash.digest();
      console.log('Computed Digest:', computedDigest);
      console.log('Attribute Digest:', attrDigest);

      if (!computedDigest.equals(Buffer.from(attrDigest))) {
        throw new Error('PDF digest does not match attribute digest');
      }

      console.log('PDF signature is valid.');
    } catch (err) {
      console.error('Verification failed:', err);
    }
  }
}

// ====================================================================================================================================

export function PdfRenderer (props: Props) {

  const DEFAULT_BYTE_RANGE_PLACEHOLDER = '**********';
  // const { getString } = React.useContext(LocaleContext)
  const [pdfFile, setPdfFile] = useState(null);
  // const [certFile, setCertFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSelectionEnabled, setIsSelectionEnabled] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [endX, setEndX] = useState(0);
  const [endY, setEndY] = useState(0);
  const [pdfBuff, setPdfBuff] = useState(0);

  const overlayCanvasRef = useRef(null);
  const pdfCanvasRef = useRef(null);
  const fixedText = "Signed by user";

  const certificateHardcode = `-----BEGIN CERTIFICATE-----
  MIIF4zCCBMugAwIBAgIGdz2M2uUGMA0GCSqGSIb3DQEBCwUAMHsxCzAJBgNVBAYT
  AklOMSgwJgYDVQQKEx9GdXR1cmlRIFN5c3RlbXMgUHJpdmF0ZSBMaW1pdGVkMQ8w
  DQYDVQQLEwZTdWItQ0ExMTAvBgNVBAMTKFNpZ25YIHN1Yi1DQSBmb3IgQ2xhc3Mg
  MyBJbmRpdmlkdWFsIDIwMjIwHhcNMjQwMTE1MDkzMTAyWhcNMjYwMTE1MDkzMTAy
  WjCCAS8xCzAJBgNVBAYTAklOMREwDwYDVQQKEwhQZXJzb25hbDENMAsGA1UEDBME
  MzE4OTEpMCcGA1UEQRMgdVpvRkcwZXEzRktZQTlWSUQ4R1FvNHBQNTdsY0tGaHQx
  STBHBgNVBBQTQDdiODc5M2Q5MzU4YzZlMGRlZWVjMzZlZjIxNDQxMjQ2M2Y1MTYx
  MzVhOWRjMDcyYjJmNmFlYzEwYTJjMjkxMTMxDzANBgNVBBETBjIwMTAwMjEWMBQG
  A1UECBMNVXR0YXIgUHJhZGVzaDFJMEcGA1UEBRNANTUzNDExODQ1Y2JhMTU4ZTdl
  NGMxMDYxNTNhMzFiZDY4OWIzOGM5MTEyNDUwN2UwNDRmM2M5ZDA5NDAzMDFjMjEU
  MBIGA1UEAxMLVWRheSBCYW5zYWwwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEK
  AoIBAQC2/UPH6hpzFUEr/D2qVjFMGIHm4YCKICFLKUvnJoAI8RfYlED5upCeNPeI
  woqey7maVUahcFqasMZQkDEw1h0oveg4p1xLpew/WfwnJ41kl0YCORmKnLvMmttG
  Pp5Qp0RjAJPwhgYqzuKUduYQ+fvKhphDe2ivFs175y4IvoNliJQ+4e/OTM5ebwcR
  p/FsBksDkkaNXJsd4cOsKUNziJNa8mb/eb7/elYpLZRgIWJLJnI6Kq5yCNWZLsCe
  mSlAns2Ys4swVH1xwMdPCEvZQljdR5wO2fqGR00rzpSgakJfcClH+nhFpqZtokcq
  xez7OCLZ3eWmKrZcfIcSllrJuTGxAgMBAAGjggG1MIIBsTATBgNVHSMEDDAKgAhA
  Sva0zedCjDARBgNVHQ4ECgQITDVERpz3ZBAwgZUGCCsGAQUFBwEBBIGIMIGFMEgG
  CCsGAQUFBzAChjxodHRwczovL3NpZ254Y2EuY29tL3JlcG9zaXRvcnkvYWlhL1Np
  Z25YQ2xhc3MzSW5kaXZpZHVhbC5jZXIwOQYIKwYBBQUHMAGGLWh0dHA6Ly9vY3Nw
  LnNpZ254Y2EuY29tL1NpZ25YQ2xhc3MzSW5kaXZpZHVhbDBNBgNVHR8ERjBEMEKg
  QKA+hjxodHRwczovL3NpZ254Y2EuY29tL3JlcG9zaXRvcnkvY3JsL1NpZ25YQ2xh
  c3MzSW5kaXZpZHVhbC5jcmwwHQYDVR0gBBYwFDAIBgZggmRkAgMwCAYGYIJkZAIC
  MAwGA1UdEwEB/wQCMAAwQAYDVR0lBDkwNwYIKwYBBQUHAwIGCCsGAQUFBwMEBgkq
  hkiG9y8BAQUGCisGAQQBgjcKAwwGCisGAQQBgjcUAgIwIQYDVR0RBBowGIEWdWRh
  eWJhbnNhbDE5QGdtYWlsLmNvbTAOBgNVHQ8BAf8EBAMCBsAwDQYJKoZIhvcNAQEL
  BQADggEBAHoCxq9RS5R2GeWhtrgXzhNNuv+HG+oR5auroxC53WHEzPr8LIEsusPi
  a47/FM+wvU4tvcLm/6EiDulrulgoG8G1LvW0eWwaMCtI1/XWY9HrVTZXjf1TaQoN
  fery9qzcNNXHnNxb0NN6NanZt7lYaRBXZBqxxZ6HH8l2SHdLwJb4i/kHFBbdYZpi
  bJgDGTXQnDvFlj8hSr289RK+FiPiDj0DGFkvBNoK65wnpTc/sVSI68XmhjQQ32rZ
  Bjc1vCF1dwfxqolhxrYiRfiyRjgGIC52CuI/J6uYuqwk5Cm/NTQW+QNIB4YM9Had
  llm7I1xIHHqkwC0uTS8UgfyOzuKN3j0=
  -----END CERTIFICATE-----`;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onPageLoadSuccess = () => {
    const pageCanvas = pdfCanvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    if (pageCanvas && overlayCanvas) {
      overlayCanvas.width = pageCanvas.width;
      overlayCanvas.height = pageCanvas.height;
    }
  };

  const handleFileInput = async(event) => {
    const file = event.target.files[0];
    const pdfBuff = await file.arrayBuffer();
    console.log("buff: ", pdfBuff);
    setPdfBuff(pdfBuff);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPdfFile(reader.result);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // const handleCertChange = (e) => setCertFile(e.target.files[0]);

  // const handleSignature = async () => {
  //   if(!pdfFile || !certFile){
  //     alert('Upload both pdf and certificate');
  //     return;
  //   }
  //   const formData = new FormData();
  //   formData.append('pdf', pdfFile);
  //   formData.append('cert', certFile);

  //   try{
  //     const response = await fetch('http://localhost:5000/sign', {
  //       method: 'POST',
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error('Network response was not ok');
  //     }

  //     const signatureHash = await response.
  //   } catch (error) {
  //     console.error('Error signing PDF:', error);
  //   }
  // };

  const addPlaceholder = async (pdfBuff, signerName) => {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuff);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
  
      // Adjust these values based on your PDF dimensions and desired positioning
      const boxLeft = 20;
      const boxBottom = 20;
      const boxWidth = 200;
      const boxHeight = 50;
  
      // Draw the rectangle
      firstPage.drawRectangle({
        x: boxLeft,
        y: firstPage.getHeight() - boxBottom - boxHeight,
        width: boxWidth,
        height: boxHeight,
        borderColor: rgb(0, 0, 0),
        borderWidth: 1,
      });
  
      // Add text inside the rectangle
      const now = new Date();
      const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
      firstPage.drawText(`Signed by ${signerName} using Ping\n${timestamp}`, {
        x: boxLeft + 10,
        y: firstPage.getHeight() - boxBottom - boxHeight + 20,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
  
      const modifiedPdfBytes = await pdfDoc.save();
  
      return modifiedPdfBytes;
    } catch (error) {
      console.error('Error adding placeholder:', error);
      throw error;
    }
  };

  const signpdf = (pdfBuffer, certificate, signatureHash) => {
    // Extract signer's name from the certificate
    const signerName = certificate.subject.getField('CN').value;
  
    // Adding placeholder
    pdfBuffer = plainAddPlaceholder({
      pdfBuffer,
      reason: `Signed by ${signerName} using Ping`,
    });
    console.log('Added placeholder:', pdfBuffer.toString('utf8', 0, 200)); // Log first 200 bytes
  
    let pdf = removeTrailingNewLine(pdfBuffer);
    console.log(
      'PDF after removing trailing new lines:',
      pdf.toString('utf8', 0, 200),
    ); // Log first 200 bytes
  
    const byteRangePlaceholder = [
      0,
      `/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`,
      `/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`,
      `/${DEFAULT_BYTE_RANGE_PLACEHOLDER}`,
    ];
    const byteRangeString = `/ByteRange [${byteRangePlaceholder.join(' ')}]`;
    const byteRangePos = pdf.indexOf(byteRangeString);
    if (byteRangePos === -1) {
      console.error(`Could not find ByteRange placeholder: ${byteRangeString}`);
      throw new Error(`Could not find ByteRange placeholder: ${byteRangeString}`);
    }
    console.log(`ByteRange found at position: ${byteRangePos}`);
  
    const byteRangeEnd = byteRangePos + byteRangeString.length;
    const contentsTagPos = pdf.indexOf('/Contents ', byteRangeEnd);
    const placeholderPos = pdf.indexOf('<', contentsTagPos);
    const placeholderEnd = pdf.indexOf('>', placeholderPos);
    const placeholderLengthWithBrackets = placeholderEnd + 1 - placeholderPos;
    const placeholderLength = placeholderLengthWithBrackets - 2;
    const byteRange = [0, 0, 0, 0];
    byteRange[1] = placeholderPos;
    byteRange[2] = byteRange[1] + placeholderLengthWithBrackets;
    byteRange[3] = pdf.length - byteRange[2];
    let actualByteRange = `/ByteRange [${byteRange.join(' ')}]`;
    actualByteRange += ' '.repeat(
      byteRangeString.length - actualByteRange.length,
    );
  
    pdf = Buffer.concat([
      pdf.slice(0, byteRangePos),
      Buffer.from(actualByteRange),
      pdf.slice(byteRangeEnd),
    ]);
    console.log(
      'PDF with updated ByteRange:',
      pdf.toString('utf8', byteRangePos, byteRangePos + 200),
    ); // Log 200 bytes around the ByteRange
  
    pdf = Buffer.concat([
      pdf.slice(0, byteRange[1]),
      pdf.slice(byteRange[2], byteRange[2] + byteRange[3]),
    ]);
    console.log(
      'PDF with removed placeholder content:',
      pdf.toString('utf8', 0, 200),
    ); // Log first 200 bytes
  
    const p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(pdf.toString('binary'));
    p7.addCertificate(certificate);
    p7.addSigner({
      key: { sign: () => signatureHash },
      certificate,
      digestAlgorithm: forge.pki.oids.sha256,
      authenticatedAttributes: [
        { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
        { type: forge.pki.oids.messageDigest },
        { type: forge.pki.oids.signingTime, value: new Date() },
      ],
    });
    p7.sign({ detached: true });
    const raw = forge.asn1.toDer(p7.toAsn1()).getBytes();
    if (raw.length * 2 > placeholderLength) {
      console.error(
        `Signature exceeds placeholder length: ${
          raw.length * 2
        } > ${placeholderLength}`,
      );
      throw new Error(
        `Signature exceeds placeholder length: ${
          raw.length * 2
        } > ${placeholderLength}`,
      );
    }
    let signature = Buffer.from(raw, 'binary').toString('hex');
    signature += Buffer.from(
      String.fromCharCode(0).repeat(placeholderLength / 2 - raw.length),
    ).toString('hex');
    pdf = Buffer.concat([
      pdf.slice(0, byteRange[1]),
      Buffer.from(`<${signature}>`),
      pdf.slice(byteRange[1]),
    ]);
    return pdf;
  };
  

  const getMousePos = (canvas, event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handleMouseDown = (event) => {
    if (!isSelectionEnabled) return;
    setIsSelecting(true);
    const pos = getMousePos(overlayCanvasRef.current, event);
    setStartX(pos.x);
    setStartY(pos.y);
    setEndX(pos.x);
    setEndY(pos.y);
  };

  const handleMouseMove = (event) => {
    if (!isSelecting || !isSelectionEnabled) return;
    const pos = getMousePos(overlayCanvasRef.current, event);
    setEndX(pos.x);
    setEndY(pos.y);
    drawSelection();
  };

  const handleMouseUp = () => {
    if (!isSelectionEnabled) return;
    setIsSelecting(false);
    showEmbedSignConfirmation();
  };

  const drawSelection = () => {
    const overlayCtx = overlayCanvasRef.current.getContext('2d');
    clearOverlay();
    overlayCtx.strokeStyle = 'blue';
    overlayCtx.lineWidth = 2;
    overlayCtx.strokeRect(startX, startY, endX - startX, endY - startY);
  };

  const clearOverlay = () => {
    const overlayCtx = overlayCanvasRef.current.getContext('2d');
    overlayCtx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
  };

  const showEmbedSignConfirmation = () => {
    const confirmation = window.confirm("Do you want to embed text in the selected area?");
    if (confirmation) {
      embedSignature();
    } else {
      clearSelection();
    }
  };

  const signingPdf = () => {
    const cert = forge.pki.certificateFromPem(certificateHardcode);
    const signerName = cert.subject.getField('CN').value;
    const pdfBuffer = addPlaceholder(pdfBuff, signerName);
    const sigHash ='6129f7c2d451c87d0693deb397d2d06a714ba954bcc866e69d642779b4b0a06e0744c36d67b71c861c8d8255590dad87db5ac0d7fa983164374f57bb758f823249264acd9f9b044df7d8ab8a08e1b6cf0a868fea3a021b9ba899a720402a9beeab377a3d2a9e98a26ee4666fbde0fbe91678fae2b63add600dbeb94af126a494b5d26722409c46f18d64d7d68db027d88637d1cfd986341d2e0dd2844265b9e1754506c299d610946d2156395d2d673bdebbc778fde4457f3d133bcd7e03e057f23808523e6c144ccd649d1ce9da1c647145a9517753e2a4fea1909b6544c398485a099f08c8c0828ea31afc0c2be3e55f920a9ff5bbdec4596ae300e2622255';
    const signedPdf = signpdf(pdfBuffer, cert, sigHash);
    const signedBlob = new Blob([signedPdf], { type: 'application/pdf' });

    const downloadUrl = URL.createObjectURL(signedBlob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'signed_document.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  }

  const embedSignature = () => {
    try{
      signingPdf();
    }
    catch (err) {
      console.log(err);
      alert("unable to sign pdf");
      return;
    }
    const overlayCtx = overlayCanvasRef.current.getContext('2d');
    overlayCtx.fillStyle = 'rgba(255, 255, 0, 0.5)';
    overlayCtx.fillRect(startX, startY, endX - startX, endY - startY);

    overlayCtx.font = '14px Arial';
    overlayCtx.fillStyle = 'black';
    overlayCtx.textAlign = 'left';
    overlayCtx.textBaseline = 'top';
    overlayCtx.fillText(fixedText, startX + 5, startY + 5);

    setIsSelectionEnabled(false);
    setIsSigned(true);
    console.log(`Selected area coordinates: Start(${startX}, ${startY}) - End(${endX}, ${endY})`);
    document.getElementById('signButton').disabled = true;
  };

  const clearSelection = () => {
    setStartX(0);
    setStartY(0);
    setEndX(0);
    setEndY(0);
    clearOverlay();
  };

  const handleSignButtonClick = () => {
    if (!isSigned) {
      setIsSelectionEnabled(true);
      console.log("Selection tool enabled. Click and drag on the PDF to select an area.");
    }
  };

  const handlePreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
  
  const handleNextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };
  
  const handlePageInputChange = (event) => {
    const newPageNumber = parseInt(event.target.value, 10);
    if (newPageNumber >= 1 && newPageNumber <= numPages) {
      setPageNumber(newPageNumber);
    }
  };

  const handleVerifyPdf = () => {
    const verifyPdf = new VerifyPdf();

    try {
      verifyPdf.verify(pdfBuff);
    } catch (error) {
      console.error('Error verifying PDF:', error);
    }
  };

  return (
    <>
      <div className="App">
      <div id="controls">
        <input type="file" id="pdfInput" accept="application/pdf" onChange={handleFileInput} />
        {/* <input type="file" id="certInput" accept=".pem" onChange={handleCertChange} /> */}
        <button id="signButton" onClick={handleSignButtonClick} disabled={isSigned}>Sign</button>
        <button onClick={handleVerifyPdf}>Verify PDF</button>
        <button onClick={handlePreviousPage} disabled={pageNumber === 1}>Previous Page</button>
        <button onClick={handleNextPage} disabled={pageNumber === numPages}>Next Page</button>
        <input
          type="number"
          value={pageNumber}
          onChange={handlePageInputChange}
          min={1}
          max={numPages}
          style={{ width: '60px' }}
        />
      </div>
      <div id="canvasContainer" style={{ position: 'relative' }}>
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div>Loading PDF...</div>}
        >
          <Page
            pageNumber={pageNumber}
            renderTextLayer={false}
            width={600}
            renderMode="canvas"
            onLoadSuccess={onPageLoadSuccess}
            canvasRef={pdfCanvasRef}
            loading={<div>Loading page...</div>}
          />
        </Document>
        <canvas
          id="overlayCanvas"
          ref={overlayCanvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            pointerEvents: isSelectionEnabled ? 'auto' : 'none',
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>
    </div>
    </>
  )
}
