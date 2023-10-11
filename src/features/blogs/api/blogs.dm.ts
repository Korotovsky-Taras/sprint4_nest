import { BlogPaginationQueryModel, BlogPaginationRepositoryModel, BlogViewModel } from '../types/dto';
import { BlogMongoType } from '../types/dao';
import { withExternalDirection, withExternalNumber, withExternalString, withExternalTerm } from '../../../application/utils/withExternalQuery';
import { toIsoString } from '../../../application/utils/date';

const initialQuery: BlogPaginationRepositoryModel = {
  sortBy: 'createdAt',
  searchNameTerm: null,
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class BlogsDataMapper {
  constructor() {}

  static toBlogsView(items: BlogMongoType[]): BlogViewModel[] {
    return items.map((item) => {
      return BlogsDataMapper.toBlogView(item);
    });
  }

  static toBlogView(item: BlogMongoType): BlogViewModel {
    return {
      id: item._id.toString(),
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
