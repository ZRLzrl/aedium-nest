import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

import { PaginationArticleDto } from './pagination-article.dto';

export class FilterArticleDto extends PaginationArticleDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  query?: string;
}
