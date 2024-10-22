/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */
export enum ErrorType {
    PDF_LOADING_ERROR = 'PDF_LOADING_ERROR',
    INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
    SIGNING_ERROR = 'SIGNING_ERROR',
    VERIFICATION_ERROR = 'VERIFICATION_ERROR',
    INVALID_PIN = 'INVALID_PIN',
    INVALID_SELECTION = 'INVALID_SELECTION',
    NO_PDF_UPLOADED = 'NO_PDF_UPLOADED',
    NETWORK_ERROR = 'NETWORK_CONNECTION_IS_BAD'
  }

  export enum SuccessPopupErrorType {
    SAVE_FAILED = 'SAVE_FAILED',
    CONTINUE_FAILED = 'CONTINUE_FAILED',
    MESSAGE_MISSING = 'MESSAGE_MISSING',
    INVALID_CALLBACK = 'INVALID_CALLBACK'
  }

  export enum DropZoneErrorType {
    FILE_TOO_LARGE = "FILE_TOO_LARGE",
    INVALID_FILE_TYPE = "INVALID_FILE_TYPE",
    FILE_READ_ERROR = "FILE_READ_ERROR",
    DROP_ZONE_UNAVAILABLE = "DROP_ZONE_UNAVAILABLE",
    UPLOAD_FAILED = "UPLOAD_FAILED",
    MULTIPLE_FILES_SELECTED = "MULTIPLE_FILES_SELECTED",
    NO_FILE_SELECTED = "NO_FILE_SELECTED",
    BROWSER_NOT_SUPPORTED = "BROWSER_NOT_SUPPORTED",
    NETWORK_ERROR = "NETWORK_ERROR",
    UNKNOWN_ERROR = "UNKNOWN_ERROR"
  }

  export enum ErrorStates {
    None = "None",
    VerificationFailed = "VerificationFailed",
    SignatureAdditionFailed = "SignatureAdditionFailed",
    FileUploadFailed = "FileUploadFailed",
    PageNumberError = "PageNumberError",
    GeneralError = "GeneralError"
}

export enum PdfSigningErrorType{
  ERROR_MODULE_NOT_FOUND,
  ERROR_SLOT_NOT_FOUND,
  ERROR_LOGIN_FAILED,
  ERROR_SIGNING_FAILURE,
  ERROR_NO_OBJS_FOUND,
  ERROR_GETTING_CERT
}

export enum PdfVerificationErrorType {
  INVALID_SIGNATURE,
  INVALID_CONTENT,
  BYTE_RANGE_NOT_FOUND,
  PARSING_ERROR,
  UNKNOWN_ERROR
}