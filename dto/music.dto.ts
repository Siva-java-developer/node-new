import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for creating a new music entry
 */
export class CreateMusicDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    language: string;

    @IsString()
    @IsNotEmpty()
    syllabus: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    class: string;

    @IsString()
    @IsNotEmpty()
    lyrics: string;

    @IsString()
    @IsNotEmpty()
    music: string;
    
    @IsString()
    thumbnail?: string;
}

/**
 * Data Transfer Object for updating an existing music entry
 */
export class UpdateMusicDto {
    @IsString()
    title?: string;

    @IsString()
    language?: string;

    @IsString()
    syllabus?: string;

    @IsString()
    subject?: string;

    @IsString()
    class?: string;

    @IsString()
    lyrics?: string;

    @IsString()
    music?: string;
    
    @IsString()
    thumbnail?: string;
}