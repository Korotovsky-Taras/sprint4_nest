import { Injectable } from '@nestjs/common';
import { IPostsRepository } from '../../types/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostCreateModel, PostViewModel } from '../../types/dto';
import { IPostSqlRaw } from '../../types/dao';
import { PostsSqlRawDataMapper } from '../sql-raw/posts.sql-raw.dm';
import { PostUpdateDto } from '../../dto/PostUpdateDto';
import { LikeStatus } from '../../../likes/types';
import { isNumber } from 'class-validator';
import { PostsEntity } from './entities/posts.entity';
import { PostsLikesEntity } from './entities/posts-likes.entity';

@Injectable()
export class PostsSqlOrmRepository implements IPostsRepository<PostsEntity> {
  constructor(
    @InjectRepository(PostsEntity) private postsRepo: Repository<PostsEntity>,
    @InjectRepository(PostsLikesEntity) private postsLikesRepo: Repository<PostsLikesEntity>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async createPost(input: PostCreateModel): Promise<PostViewModel> {
    const post = PostsEntity.createPost(input);

    await this.saveDoc(post);

    const queryBuilder = this.postsRepo.createQueryBuilder('p');

    const res = await queryBuilder
      .leftJoin('p.blog', 'pb')
      .leftJoin('p.postLikes', 'pl')
      .select('p.*')
      .addSelect(`pb."_id"`, 'blogId')
      .addSelect(`pb.name`, 'blogName')
      .where('p."_id" = :postId', { postId: Number(post._id) })
      .getRawMany<IPostSqlRaw>();

    return PostsSqlRawDataMapper.toPostView({
      ...res[0],
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: null,
      },
      lastLikes: [],
    });
  }

  async updatePostById(id: string, dto: PostUpdateDto): Promise<boolean> {
    const post: PostsEntity | null = await this.postsRepo.findOne({
      where: { _id: Number(id) },
    });
    if (post == null) {
      return false;
    }

    post.blogId = Number(dto.blogId);
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;

    await this.saveDoc(post);

    return true;
  }

  async updateLike(postId: string, status: LikeStatus, userId: string): Promise<boolean> {
    if (status === LikeStatus.NONE) {
      const res = await this.postsLikesRepo
        .createQueryBuilder()
        .delete()
        .where({ postId: Number(postId), userId: Number(userId) })
        .execute();

      return res.affected != null && res.affected > 0;
    }

    let postLike: PostsLikesEntity | null = await this.postsLikesRepo.findOne({ where: { postId: Number(postId), userId: Number(userId) } });

    const nextStatus = status === LikeStatus.DISLIKE ? 0 : 1;

    if (postLike == null) {
      postLike = new PostsLikesEntity();
      postLike.userId = Number(userId);
      postLike.postId = Number(postId);
    }

    postLike.likeStatus = nextStatus;

    await this.postsLikesRepo.save(postLike);
    return true;
  }

  async isPostByIdExist(id: string): Promise<boolean> {
    if (!isNumber(Number(id))) {
      return false;
    }
    const post: PostsEntity | null = await this.postsRepo.findOne({ where: { _id: Number(id) } });
    return post != null;
  }

  async deletePostById(id: string): Promise<boolean> {
    const res = await this.postsRepo
      .createQueryBuilder()
      .delete()
      .where({ _id: Number(id) })
      .execute();

    return res.affected != null && res.affected > 0;
  }

  async isBlogPostByIdExist(blogId: string, postId: string): Promise<boolean> {
    const post: PostsEntity | null = await this.postsRepo.findOne({ where: { _id: Number(postId), blogId: Number(blogId) } });
    return post != null;
  }

  async updateBlogPostById(blogId: string, postId: string, dto: PostUpdateDto): Promise<boolean> {
    const post: PostsEntity | null = await this.postsRepo.findOne({ where: { _id: Number(postId), blogId: Number(blogId) } });

    if (post == null) {
      return false;
    }

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;

    await this.saveDoc(post);

    return true;
  }

  async deleteBlogPostById(blogId: string, postId: string): Promise<boolean> {
    const res = await this.postsRepo
      .createQueryBuilder()
      .delete()
      .where({ _id: Number(postId), blogId: Number(blogId) })
      .execute();

    return res.affected != null && res.affected > 0;
  }

  async saveDoc(doc: PostsEntity): Promise<void> {
    await this.postsRepo.save(doc);
  }

  async clear(): Promise<void> {
    await this.postsRepo.createQueryBuilder().delete().from(PostsEntity).where('1=1').execute();
  }
}
