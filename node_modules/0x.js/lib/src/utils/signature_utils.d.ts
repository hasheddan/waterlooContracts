import { ECSignature } from '../types';
export declare const signatureUtils: {
    parseSignatureHexAsVRS(signatureHex: string): ECSignature;
    parseSignatureHexAsRSV(signatureHex: string): ECSignature;
};
