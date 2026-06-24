import { FilterQuery } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

import { CreateArticleDto } from './dto/create-article.dto';
// import { PaginationArticleDto } from './dto/pagination-article.dto';
import { FilterArticleDto } from './dto/filter-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Article, ArticleStatus } from './entities/article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: EntityRepository<Article>,
    private readonly em: EntityManager,
  ) {}

  // 用户创建文章
  async createByCurrentUser(
    authorId: number,
    createArticleDto: CreateArticleDto,
  ) {
    // 检查作者是否存在
    const user = await this.em.findOne(User, { id: authorId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 创建文章
    this.articleRepository.create({
      ...createArticleDto,
      author: user,
    });

    await this.em.flush();
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Article created successfully',
    };
  }

  // 所有人可以查看的文章
  async findAllPublic(filterArticleDto: FilterArticleDto) {
    const { page, limit, query } = filterArticleDto;
    // 计算偏移量
    const offset = (page - 1) * limit;

    const where: FilterQuery<Article> = {
      status: ArticleStatus.PUBLISHED,
    };

    if (query) {
      where.title = {
        $ilike: `%${query}%`,
      };
    }

    const articles = await this.articleRepository.findAll({
      offset,
      limit,
      exclude: ['content', 'updatedAt'],
      where,
    });
    return articles;
  }

  // 用户查看自己的文章
  async findMyArticles(authorId: number, filterArticleDto: FilterArticleDto) {
    const { page, limit, query } = filterArticleDto;
    // 计算偏移量
    const offset = (page - 1) * limit;

    const where: FilterQuery<Article> = {
      author: {
        id: authorId,
      },
    };
    if (query) {
      where.title = {
        $ilike: `%${query}%`,
      };
    }

    const articles = await this.articleRepository.findAll({
      offset,
      limit,
      exclude: ['content', 'updatedAt'],
      where,
    });
    return articles;
  }

  // 管理员查看所有文章
  async findAll(filterArticleDto: FilterArticleDto) {
    const { page, limit, query } = filterArticleDto;
    // 计算偏移量
    const offset = (page - 1) * limit;

    const where: FilterQuery<Article> = {};
    if (query) {
      where.title = {
        $ilike: `%${query}%`,
      };
    }

    const articles = await this.articleRepository.findAll({
      offset,
      limit,
      exclude: ['content', 'updatedAt'],
      where,
    });
    return articles;
  }

  // 所有人可以查看的文章
  async findOnePublic(id: number) {
    // 查询文章并populate作者信息
    const article = await this.articleRepository.findOne(
      { id, status: ArticleStatus.PUBLISHED },
      {
        populate: ['author'],
        exclude: ['author.password', 'author.email', 'author.refreshToken'],
      },
    );
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async findOne(id: number) {
    // 查询文章并populate作者信息
    const article = await this.articleRepository.findOne(id, {
      populate: ['author'],
      exclude: ['author.password'],
    });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }

  async findOneByCurrentUser(authorId: number, articleId: number) {
    const article = await this.findArticleWithAuthorId(articleId, authorId);
    return article;
  }

  // 用户更新文章
  async updateByCurrentUser(
    authorId: number,
    articleId: number,
    updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.findArticleWithAuthorId(articleId, authorId);
    // 更新文章数据
    this.em.assign(article, updateArticleDto);
    await this.em.flush();
    return article;
  }

  // 用户删除自己的文章
  async removeByCurrentUser(authorId: number, articleId: number) {
    const article = await this.findArticleWithAuthorId(articleId, authorId);
    // 删除文章
    this.em.remove(article);
    await this.em.flush();
    return {
      statusCode: HttpStatus.OK,
      message: 'Article deleted successfully',
    };
  }

  // 管理员删除文章
  async remove(articleId: number) {
    const article = await this.articleRepository.findOne(articleId);
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // 删除文章
    this.em.remove(article);
    await this.em.flush();
    return {
      statusCode: HttpStatus.OK,
      message: 'Article deleted successfully',
    };
  }

  // 查找文章并检查作者是否匹配
  private async findArticleWithAuthorId(articleId: number, authorId: number) {
    const article = await this.articleRepository.findOne({
      id: articleId,
      author: {
        id: authorId,
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }
}
