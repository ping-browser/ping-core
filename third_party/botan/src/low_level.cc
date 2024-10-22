#include <iostream>
#include <string>
#include <sstream>
#include <iomanip>
#include "cryptoki.h"
#include <stdlib.h>
#include <string.h>
#include "pkcs.h"

#if defined(__APPLE__) || defined(__unix__)
#include <dlfcn.h>
    #define NIX
#else
    #include <windows.h>
#endif

#ifdef NIX
    void *libHandle = nullptr;
#else
    HINSTANCE libHandle = nullptr;
#endif

CK_FUNCTION_LIST *p11Func = nullptr;
CK_SLOT_ID slotId = 1;
CK_SESSION_HANDLE hSession = 0;
CK_BYTE *slotPin = nullptr;
const char *libPath = nullptr;
CK_OBJECT_HANDLE hPrivate = 0;
CK_BYTE *signature = nullptr;
CK_ULONG sigLen = 0;
bool somethingWentWrong = false;
std::string result;

void loadHSMLibrary() {
    if (libPath == nullptr) {
        somethingWentWrong = true;
        return;
    }

#ifdef NIX
    libHandle = dlopen(libPath, RTLD_NOW);
#else
    libHandle = LoadLibraryA(libPath);
#endif

    if (!libHandle) {
        somethingWentWrong = true;
        std::cout << "Failed to load P11 library. " << libPath << std::endl;
        return;
    }

#ifdef NIX
    CK_C_GetFunctionList C_GetFunctionList = (CK_C_GetFunctionList)dlsym(libHandle, "C_GetFunctionList");
#else
    CK_C_GetFunctionList C_GetFunctionList = (CK_C_GetFunctionList)GetProcAddress(libHandle, "C_GetFunctionList");
#endif

    C_GetFunctionList(&p11Func);
    if (!p11Func) {
        somethingWentWrong = true;
        std::cout << "Failed to load P11 Functions." << std::endl;
        return;
    }
}

void freeResource() {
#ifdef NIX
    dlclose(libHandle);
#else
    FreeLibrary(libHandle);
#endif
    p11Func = nullptr;
    slotPin = nullptr;
}

void checkOperation(CK_RV rv, const char *message) {
    if (rv != CKR_OK && rv != CKR_CRYPTOKI_ALREADY_INITIALIZED) {
        std::cout << message << " failed with : " << rv << std::endl;
        printf("RV : %#08lx\n", rv);
        freeResource();
        somethingWentWrong = true;
    }
}

void connectToSlot(bool isLoginNeeded) {
    if (!somethingWentWrong)
        checkOperation(p11Func->C_Initialize(nullptr), "C_Initialize");
    if (!somethingWentWrong)
        checkOperation(p11Func->C_OpenSession(slotId, CKF_SERIAL_SESSION | CKF_RW_SESSION, nullptr, nullptr, &hSession), "C_OpenSession");
    if (!somethingWentWrong && isLoginNeeded)
        checkOperation(p11Func->C_Login(hSession, CKU_USER, slotPin, strlen((const char *)slotPin)), "C_Login");
}

void disconnectFromSlot(bool isLoginNeeded) {
    if (isLoginNeeded && !somethingWentWrong)
        checkOperation(p11Func->C_Logout(hSession), "C_Logout");
    if (!somethingWentWrong)
        checkOperation(p11Func->C_CloseSession(hSession), "C_CloseSession");
    if (!somethingWentWrong)
        checkOperation(p11Func->C_Finalize(nullptr), "C_Finalize");
}

void findPrivateKey() {
    CK_OBJECT_CLASS objClass = CKO_PRIVATE_KEY;
    CK_ATTRIBUTE searchTemplate[] = {
        {CKA_CLASS, &objClass, sizeof(CK_OBJECT_CLASS)},
    };
    CK_OBJECT_HANDLE hObject;
    CK_ULONG ulObjectCount = 0;

    if (!somethingWentWrong)
        checkOperation(p11Func->C_FindObjectsInit(hSession, searchTemplate, sizeof(searchTemplate) / sizeof(CK_ATTRIBUTE)), "C_FindObjectsInit");
    if (!somethingWentWrong)
        checkOperation(p11Func->C_FindObjects(hSession, &hObject, 1, &ulObjectCount), "C_FindObjects");
    if (ulObjectCount == 0) {
        somethingWentWrong = true;
        std::cout << "No private key found matching the criteria." << std::endl;
        freeResource();
    } else {
        hPrivate = hObject;
    }
    if (!somethingWentWrong)
        checkOperation(p11Func->C_FindObjectsFinal(hSession), "C_FindObjectsFinal");
}

std::string bytesToHexString(const CK_BYTE* bytes, CK_ULONG length) {
    std::stringstream ss;
    ss << std::hex << std::setfill('0');
    for (CK_ULONG i = 0; i < length; ++i) {
        ss << std::setw(2) << static_cast<int>(bytes[i]);
    }
    return ss.str();
}

void signData(CK_BYTE* plainData, size_t byteLength) {
    CK_MECHANISM mech = {CKM_RSA_PKCS, NULL_PTR, 0};

    if (!somethingWentWrong)
        checkOperation(p11Func->C_SignInit(hSession, &mech, hPrivate), "C_SignInit");
    if (!somethingWentWrong)
        checkOperation(p11Func->C_Sign(hSession, plainData, byteLength, nullptr, &sigLen), "C_Sign");
    signature = new CK_BYTE[sigLen];
    if (!somethingWentWrong)
        checkOperation(p11Func->C_Sign(hSession, plainData, byteLength, signature, &sigLen), "C_Sign");

    result = bytesToHexString(signature, sigLen);
}

void hexStringToByteArray(const std::string& hexString, CK_BYTE* byteArray, size_t byteLength) {
    for (size_t i = 0; i < byteLength; ++i) {
        byteArray[i] = static_cast<CK_BYTE>(std::stoi(hexString.substr(2 * i, 2), nullptr, 16));
    }
}

std::string base64_encode(const unsigned char *data, size_t len) {
    const char base64_chars[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::string encoded;
    encoded.reserve(((len + 2) / 3) * 4);

    for (size_t i = 0; i < len; i += 3) {
        unsigned int octet_a = i < len ? data[i] : 0;
        unsigned int octet_b = i + 1 < len ? data[i + 1] : 0;
        unsigned int octet_c = i + 2 < len ? data[i + 2] : 0;

        unsigned int triple = (octet_a << 16) + (octet_b << 8) + octet_c;

        encoded += base64_chars[(triple >> 18) & 0x3F];
        encoded += base64_chars[(triple >> 12) & 0x3F];
        encoded += i + 1 < len ? base64_chars[(triple >> 6) & 0x3F] : '=';
        encoded += i + 2 < len ? base64_chars[triple & 0x3F] : '=';
    }

    return encoded;
}

std::string exportCertificateToPEM() {
    CK_OBJECT_CLASS certClass = CKO_CERTIFICATE;
    CK_ATTRIBUTE searchTemplate[] = {
        {CKA_CLASS, &certClass, sizeof(certClass)}
    };
    CK_OBJECT_HANDLE hObject;
    CK_ULONG ulObjectCount = 0;

    if (!somethingWentWrong)
        checkOperation(p11Func->C_FindObjectsInit(hSession, searchTemplate, sizeof(searchTemplate) / sizeof(CK_ATTRIBUTE)), "C_FindObjectsInit");
    if (!somethingWentWrong)
        checkOperation(p11Func->C_FindObjects(hSession, &hObject, 1, &ulObjectCount), "C_FindObjects");
    if (ulObjectCount == 0) {
        somethingWentWrong = true;
        std::cout << "No certificate found matching the criteria." << std::endl;
        freeResource();
        return "";
    }

    CK_BYTE *certData = nullptr;
    CK_ULONG certDataLen = 0;

    CK_ATTRIBUTE certTemplate[] = {
        {CKA_VALUE, nullptr, 0}
    };
    certTemplate[0].ulValueLen = 0;

    if (!somethingWentWrong)
        checkOperation(p11Func->C_GetAttributeValue(hSession, hObject, certTemplate, sizeof(certTemplate) / sizeof(CK_ATTRIBUTE)), "C_GetAttributeValue");
    certData = new CK_BYTE[certTemplate[0].ulValueLen];
    certTemplate[0].pValue = certData;

    if (!somethingWentWrong)
        checkOperation(p11Func->C_GetAttributeValue(hSession, hObject, certTemplate, sizeof(certTemplate) / sizeof(CK_ATTRIBUTE)), "C_GetAttributeValue");

    std::stringstream pemCertStream;
    pemCertStream << "-----BEGIN CERTIFICATE-----" << std::endl;
    std::string base64_cert = base64_encode(certData, certTemplate[0].ulValueLen);
    const int LINE_LENGTH = 64;
    for (size_t i = 0; i < base64_cert.length(); i += LINE_LENGTH) {
        pemCertStream << base64_cert.substr(i, LINE_LENGTH) << std::endl;
    }
    pemCertStream << "-----END CERTIFICATE-----" << std::endl;

    delete[] certData;

    if (!somethingWentWrong)
        checkOperation(p11Func->C_FindObjectsFinal(hSession), "C_FindObjectsFinal");

    return pemCertStream.str();
}

std::string botan_high_level::pkcs11::sign_data(char* module_path, char* pin, char* md_hash) {
    somethingWentWrong = false;
    libPath = module_path;

    bool isLoginNeeded = true;

    slotPin = new CK_BYTE[strlen(pin) + 1];
    strcpy((char *)slotPin, pin);

    std::string hexString = std::string(md_hash);
    size_t byteLength = hexString.size() / 2;
    CK_BYTE* plainData = new CK_BYTE[byteLength];
    hexStringToByteArray(hexString, plainData, byteLength);

    loadHSMLibrary();

    if (somethingWentWrong) {
        result = "ERROR_MODULE_NOT_FOUND";
        return result;
    }

    std::cout << "Loaded Module" << std::endl;

    connectToSlot(isLoginNeeded);

    if (somethingWentWrong) {
        result = "ERROR_LOGIN_FAILED";
        return result;
    }

    std::cout << "Slot Found" << std::endl;

    findPrivateKey();

    if (somethingWentWrong) {
        result = "ERROR_NO_OBJS_FOUND";
        return result;
    }

    std::cout << "Private Key Found" << std::endl;

    signData(plainData, byteLength);

    if (somethingWentWrong) {
        result = "ERROR_SIGNING_FAILURE";
        return result;
    }

    disconnectFromSlot(isLoginNeeded);
    std::cout << "Disconnected from slot." << std::endl;
    freeResource();

    return result;
}

std::string botan_high_level::pkcs11::get_cert(char* module_path) {
    somethingWentWrong = false;
    libPath = module_path;
    bool isLoginNeeded = false;

    loadHSMLibrary();

    if (somethingWentWrong) {
        result = "ERROR_MODULE_NOT_FOUND";
        return result;
    }

    std::cout << "Loaded Module" << std::endl;

    connectToSlot(false);

    if (somethingWentWrong) {
        result = "ERROR_SLOT_NOT_FOUND";
        return result;
    }

    std::cout << "Slot Found" << std::endl;

    std::string result = exportCertificateToPEM();

    disconnectFromSlot(isLoginNeeded);
    std::cout << "Disconnected from slot." << std::endl;
    freeResource();

    return result;
}