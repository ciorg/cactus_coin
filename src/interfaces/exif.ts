export interface Exif {
    startMarker: {
        openWithOffset: any;
        offset: number;
    },
    tags: ExifTags,
    imageSize: {
        height: number;
        width: number;
    },
    thumbnailOffset: number;
    thumbnailLength: number;
    thumbnailType: number;
    app1Offset: number;
    getThumbnailBuffer: () => Buffer;
    hasThumbnail: () => boolean
}

export interface ExifTags {
    ImageWidth: number;
    ImageHeight: number;
    Make: string;
    Model: string;
    Orientation: number;
    XResolution: number;
    YResolution: number;
    ResolutionUnit: number;
    Software: string;
    ModifyDate: number;
    YCbCrPositioning: number;
    GPSVersionID: number[]
    GPSLatitudeRef: string;
    GPSLatitude: number;
    GPSLongitudeRef: string;
    GPSLongitude: number;
    GPSAltitudeRef: number;
    GPSAltitude: number;
    GPSTimeStamp: number[];
    GPSDateStamp: string;
    ExposureTime: number;
    FNumber: number;
    ExposureProgram: number;
    ISO: number;
    DateTimeOriginal: number;
    CreateDate: number;
    ShutterSpeedValue: number;
    ApertureValue: number;
    BrightnessValue: number;
    ExposureCompensation: number;
    MaxApertureValue: number;
    MeteringMode: number;
    LightSource: number;
    Flash: number;
    FocalLength: number;
    ColorSpace: number;
    ExifImageWidth: number;
    ExifImageHeight: number;
    SensingMethod: number;
    ExposureMode: number;
    WhiteBalance: number;
    FocalLengthIn35mmFormat: number;
    SceneCaptureType: number;
    ImageUniqueID: string;
    InteropIndex: string;
}