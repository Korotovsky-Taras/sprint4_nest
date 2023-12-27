import { BlogPaginationQueryModel, BlogPaginationRepositoryModel, BlogViewModel } from '../../types/dto';
import { withExternalDirection, withExternalNumber, withExternalString, withExternalTerm } from '../../../../application/utils/withExternalQuery';
import { toIsoString } from '../../../../application/utils/date';
import { BlogsEntity } from './blogs.entity';

const initialQuery: BlogPaginationRepositoryModel = {
  sortBy: 'createdAt',
  searchNameTerm: null,
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class BlogsSqlOrmDataMapper {
  static toBlogsView(items: BlogsEntity[]): BlogViewModel[] {
    return items.map((item) => {
      return BlogsSqlOrmDataMapper.toBlogView(item);
    });
  }

  static toBlogView(item: BlogsEntity): BlogViewModel {
    return {
      id: String(item._id),
      name: item.name,
      description: item.description,
      websiteUrl: item.websiteUrl,
      createdAt: toIsoString(item.createdAt),
      isMembership: item.isMembership,
    };
  }

  static toRepoQuery(query: BlogPaginationQueryModel): BlogPaginationRepositoryModel {
    return {
      sortBy: withExternalString(initialQuery.sortBy, query.sortBy),
      searchNameTerm: withExternalTerm(initialQuery.searchNameTerm, query.searchNameTerm),
      sortDirection: withExternalDirection(initialQuery.sortDirection, query.sortDirection),
      pageNumber: withExternalNumber(initialQuery.pageNumber, query.pageNumber),
      pageSize: withExternalNumber(initialQuery.pageSize, query.pageSize),
    };
  }
}
