import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { Public } from 'src/auth/decorator/public.decorator';

import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { PaginationArticleDto } from './dto/pagination-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get('public')
  @Public()
  findAllPublic(@Query() paginationArticleDto: PaginationArticleDto) {
    return this.articlesService.findAllPublic(paginationArticleDto);
  }

  @Get('public/:id')
  @Public()
  findOnePublic(@Param('id') id: number) {
    return this.articlesService.findOnePublic(id);
  }

  // 用户查看自己的文章
  @Get('me')
  findMyArticles(@Req() req: any, @Query() filterArticleDto: FilterArticleDto) {
    const authorId = Number(req.user.sub);
    return this.articlesService.findMyArticles(authorId, filterArticleDto);
  }

  // 用户创建文章
  @Post('me')
  createByCurrentUser(
    @Req() req: any,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    const authorId = Number(req.user.id);
    return this.articlesService.createByCurrentUser(authorId, createArticleDto);
  }

  @Get()
  // 只有管理员才能获取所有文章
  @Roles(Role.Admin)
  findAll(@Query() filterArticleDto: FilterArticleDto) {
    return this.articlesService.findAll(filterArticleDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.articlesService.findOne(id);
  }

  @Get('me/:id')
  findOneByCurrentUser(@Req() req: any, @Param('id') articleId: number) {
    const authorId = Number(req.user.id);
    return this.articlesService.findOneByCurrentUser(authorId, articleId);
  }

  @Patch('me/:id')
  updateByCurrentUser(
    @Req() req: any,
    @Param('id') articleId: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    const authorId = Number(req.user.id);
    return this.articlesService.updateByCurrentUser(
      authorId,
      articleId,
      updateArticleDto,
    );
  }

  // 用户删除自己的文章
  @Delete('me/:id')
  removeByCurrentUser(@Req() req: any, @Param('id') articleId: number) {
    const authorId = Number(req.user.id);
    return this.articlesService.removeByCurrentUser(authorId, articleId);
  }

  // 管理员删除文章
  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') articleId: number) {
    return this.articlesService.remove(articleId);
  }
}
