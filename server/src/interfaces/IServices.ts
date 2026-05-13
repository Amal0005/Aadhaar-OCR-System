export interface IOCRService {
  processImage(imagePath: string): Promise<string>;
  parseData(text: string): any;
}

export interface IAadhaarService {
  processAadhaar(frontPath: string, backPath: string): Promise<any>;
}
