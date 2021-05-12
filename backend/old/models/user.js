import { Model } from 'objection';
import { Password } from './password';
import { TABLES } from '../tables';

export default class User extends Password {
    static tableName = TABLES.User;

    fullName() {
        return this.firstName + ' ' + this.lastName;
    }

    static get relationMappings() {
        const { Business, Email, Order, Phone, Role } = require('.');
        return {
            business: {
                relation: Model.BelongsToOneRelation,
                modelClass: Business,
                join: {
                    from: `${tableName}.businessId`,
                    to: `${TABLES.Business}.id`
                }
            },
            phones: {
                relation: Model.HasManyRelation,
                modelClass: Phone,
                join: {
                    from: `${tableName}.id`,
                    to: `${TABLES.Phone}.userId`
                }
            },
            emails: {
                relation: Model.HasManyRelation,
                modelClass: Email,
                join: {
                    from: `${tableName}.id`,
                    to: `${TABLES.Email}.userId`
                }
            },
            orders: {
                relation: Model.HasManyRelation,
                modelClass: Order,
                join: {
                    from: `${tableName}.id`,
                    to: `${TABLES.Order}.id`
                }
            },
            roles: {
                relation: Model.ManyToManyRelation,
                modelClass: Role,
                join: {
                    from: `${tableName}.id`,
                    through: {
                        from: `${TABLES.UserRoles}.userId`,
                        to: `${TABLES.UserRoles}.roleId`
                    },
                    to: `${TABLES.Role}.id`
                }
            }
        }
    }
}