// Copyright (c) 2024 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.

// Copyright (c) 2024 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// You can obtain one at https://mozilla.org/MPL/2.0/.
import { pki, asn1, util } from 'node-forge'
import pkcs7 from '../lib/pkcs7'
import SignPdfError from './SignPdfError'
import { removeTrailingNewLine, plainAddPlaceholder } from '../helpers'
import { DEFAULT_BYTE_RANGE_PLACEHOLDER } from '../helpers/const'
import { SelectionCoords } from '../pdf_renderer'

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { Signature, StoredSignature } from './types'

// Hardcoded certificate (this is a placeholder, replace with actual PEM-encoded certificate)
const hardcodedCertificate = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIUMDEyMzQ1Njc4OTAxMjM0NTY3ODkwMTIzNDU2Nzg5MDE=
...
-----END CERTIFICATE-----`;

// Hardcoded signature (this is a placeholder, replace with actual signature)
const hardcodedSignature = 'abc123def456ghi789';

const PLACEHOLDER_IMG_HEX =
  '89504e470d0a1a0a0000000d4948445200000092000000920806000000ae7b938e000000097048597300000b1300000b1301009a9c18000000017352474200aece1ce90000000467414d410000b18f0bfc610500000215494441547801eddd316e14411040d1b20d487644c4fd8f681210162b312307e4deef96b6f73da94f305f5351753fcccc8fe33c0d7cdce57144c4f59e1e07024222212412422221241242222124124222212412422221241242222124124222212412422221241242222124124222212412422221241242222124125f66adcb71fe0c2b3c1fe76116591dd2dfe3fc1c5638bfedb759c468232124124222212412422221241242222124124222212412422221241242222124124222212412422221241242222124124222212412abd7913edbf91ae6b2159c2bbdcdfb9edf16760be98ce8fbdc86d7e3fc9e4d186d2476fb23f1dfaf59b81e2fa47d2d1d9b461b09219110120921911012092191101209219110120921911012092191101209219110120921911012092191101209219110120921911012092191101209219110120921911012092191101209219110120921911012097748eeeb79deef1d5f4248fb7a998597d71b6d2476fb239dcf32bcce6d789b8dec16d2f9b6c736cf32dc12a38d8490480889849048088984904808898490480889849048088984904808898490480889849048088984904808898490480889849048dcdba6edb9c6fc32f7e1eb2c746f219dbbf0cbd698ef89d146424824844442482484444248248444424824844442482484444248248444424824844442482484444248248444424824844442482484444248248444e20ce932709dcb3ff70414419c1505c80000000049454e44ae426082'

const LOCAL_STORAGE_SIGNATURES_KEY = 'LOCAL_STORAGE_SIGNATURES_KEY'

const addPlaceholder = async (
  pdfBuffer: Buffer,
  certificate: pki.Certificate,
  pageIndex: number,
  selectionCoords: SelectionCoords
): Promise<Buffer> => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const page = pdfDoc.getPage(pageIndex)

    const { startX, startY, endX, endY } = selectionCoords

    const width = endX - startX
    const height = endY - startY

    // Draw border
    page.drawRectangle({
      x: startX,
      y: page.getHeight() - endY,
      width: width,
      height: height,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1
    })

    const imageBytes = Buffer.from(PLACEHOLDER_IMG_HEX, 'hex')
    const image = await pdfDoc.embedPng(imageBytes)
    const scaleFactor =
      Math.min(width / image.width, height / image.height) * 0.8
    page.drawImage(image, {
      x: startX + (width - image.width * scaleFactor) / 2,
      y: page.getHeight() - startY - (height + image.height * scaleFactor) / 2,
      width: image.width * scaleFactor,
      height: image.height * scaleFactor,
      opacity: 0.8
    })
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const now = new Date()
    const timestamp = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`

    // Extract details from certificate
    const commonName = certificate.subject.getField('CN')?.value || 'Unknown'

    // Draw text
    const drawText = (
      text: string,
      x: number,
      y: number,
      size: number,
      isRegular = false
    ) => {
      if (page) {
        page.drawText(text, {
          x: startX + x,
          y: page.getHeight() - startY - y,
          size: size,
          font: isRegular ? regularFont : font,
          color: rgb(0, 0, 0)
        })
      } else {
        console.log('page value is initialised as null')
      }
    }

    drawText(`Digitally signed by ${commonName}`, 10, 25, 14)
    drawText(timestamp, 10, 45, 10, true)

    const modifiedPdfBytes = await pdfDoc.save({
      addDefaultPage: false,
      useObjectStreams: false
    })

    return Buffer.from(modifiedPdfBytes)
  } catch (error) {
    console.error('Error adding placeholder:', error)
    throw error
  }
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
  const raw = asn1.toDer(p7.toAsn1()).getBytes()
  if (raw.length * 2 > placeholderLength) {
    throw new SignPdfError(
      `Signature exceeds placeholder length: ${raw.length * 2} > ${placeholderLength}`,
      SignPdfError.TYPE_INPUT
    )
  }

  let signature = Buffer.from(raw, 'binary').toString('hex')
  let hexSignature = signature

  signature += Buffer.from(
    String.fromCharCode(0).repeat(placeholderLength / 2 - raw.length)
  ).toString('hex')

  let signedPdf = Buffer.concat([
    pdf.slice(0, byteRange[1]),
    Buffer.from(`<${signature}>`),
    pdf.slice(byteRange[1])
  ])

  return { signedPdf, hexSignature }
}

export const signPdf = async (
  pdfBuff: Buffer,
  currentPageIndex: number,
  selectionCoords: SelectionCoords,
  { certificate, hsmPath }: Signature,
  pin: string
): Promise<Buffer> => {
  // Add placeholder to the PDF
  const pdfWithPlaceholder = await addPlaceholder(
    pdfBuff,
    certificate,
    currentPageIndex,
    selectionCoords
  )

  // Get the signable PDF buffer
  const { pdf, placeholderLength, byteRange } = getSignablePdfBuffer(pdfWithPlaceholder)

  // Create the signer object
  let signer: any = {}
  signer.sign = async () => {
    // Use hardcoded signature instead of calling Chrome API
    return Buffer.from(hardcodedSignature, 'hex').toString('binary');
  }

  const p7 = pkcs7.createSignedData()
  p7.content = util.createBuffer(pdf.toString('binary'))

  p7.addCertificate(certificate)
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
      },
      {
        type: pki.oids.signingTime,
        value: new Date().toString()
      }
    ]
  })

  await p7.sign({ detached: true })

  // Embed P7 in PDF
  const { signedPdf } = embedP7inPdf(pdf, p7, byteRange, placeholderLength)

  return signedPdf
}

export const getCertificate = async (hsmPath: string): Promise<string> => {
  // Return hardcoded certificate instead of calling Chrome API
  return hardcodedCertificate;
}

export const addSignature = async (hsmPath: string) => {
  const certString = await getCertificate(hsmPath)
  const signature = {
    hsmPath,
    certString
  }
  const signatures = localStorage.getItem('signatures') || []
  localStorage.setItem(
    LOCAL_STORAGE_SIGNATURES_KEY,
    JSON.stringify([...signatures, signature])
  )
}

export const getSignatures = () => {
  const signatureList = localStorage.getItem(LOCAL_STORAGE_SIGNATURES_KEY)
  const signatures = signatureList ? JSON.parse(signatureList) : []
  return signatures.map((storedSignature: StoredSignature) => {
    const certificate = pki.certificateFromPem(storedSignature.certString)

    const signature: Signature = {
      ...storedSignature,
      certificate,
      id: certificate.serialNumber,
      name: certificate?.subject?.getField('CN')?.value || 'Unknown',
      expiry: certificate?.validity?.notAfter
    }

    return signature
  })
}