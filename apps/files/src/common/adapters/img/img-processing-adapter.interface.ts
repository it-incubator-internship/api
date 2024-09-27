export interface ImgProcessingAdapter {
  convertToWebp(filePath: string, maxSizeInBytes: number, quality?: number): Promise<string>;
}

export const IMG_PROCESSING_ADAPTER = Symbol('ImgProcessingAdapter');
