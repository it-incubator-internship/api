export interface ImgProcessingAdapter {
  convertToWebp(filePath: string, maxSizeInBytes: number, quality?: number): Promise<string>;
  convertToPng(filePath: string, maxSizeInBytes: number, quality?: number): Promise<string>;
  resizeAvatar(filePath: string): Promise<string>;
}

export const IMG_PROCESSING_ADAPTER = Symbol('ImgProcessingAdapter');
