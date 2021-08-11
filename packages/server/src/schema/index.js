import * as Address from './address';
import * as Business from './business';
import * as Customer from './customer';
import * as Discount from './discount';
import * as Email from './email';
import * as Feedback from './feedback';
import * as Image from './image';
import * as Order from './order';
import * as OrderItem from './orderItem';
import * as Phone from './phone';
import * as Plant from './plant';
import * as Role from './role';
import * as Sku from './sku';
import * as Task from './task';
import { readFiles, saveFiles } from '../utils';
import {
    makeSchema,
    nonNull,
    objectType,
    stringArg,
    arg,
    asNexusMethod,
    list,
    scalarType
} from 'nexus';
import { DateTimeResolver } from 'graphql-scalars';
import * as FileType from "file-type";


const DateTime = asNexusMethod(DateTimeResolver, 'date');

export const Upload = scalarType({
    name: "Upload",
    asNexusMethod: "upload", // We set this to be used as a method later as `t.upload()` if needed
    description: "desc",
    serialize: () => {
        throw new GraphQLError("Upload serialization unsupported.");
    },
    parseValue: async (value) => {
        const upload = await value;
        const stream = upload.createReadStream();
        const fileType = await FileType.fromStream(stream);

        if (fileType?.mime !== upload.mimetype)
            throw new GraphQLError("Mime type does not match file content.");

        return upload;
    },
    parseLiteral: (ast) => {
        throw new GraphQLError("Upload literal unsupported.", ast);
    },
});

export const File = objectType({
    name: "File",
    definition(t) {
        t.id("id");
        t.string("path");
        t.string("filename");
        t.string("mimetype");
        t.string("encoding");
    },
});

const Query = objectType({
    name: 'Query',
    definition(t) {
        t.nonNull.field('readAssets', {
            type: nonNull(list(stringArg())),
            args: {
                files: nonNull(list(nonNull(stringArg())))
            },
            resolve: async (_, args) => {
                return await readFiles(args.files);
            }
        })
    }
})

const Mutation = objectType({
    name: 'Mutation',
    definition(t) {
        t.nonNull.field('writeAssets', {
            type: 'Boolean',
            args: {
                files: nonNull(list(nonNull(arg({ type: 'Upload' }))))
            },
            resolve: async (_, args) => {
                const data = await saveFiles(args.files);
                // Any failed writes will return null
                return !data.some(d => d === null)
            }
        })
    },
})


const Schemas = [
    Address,
    Business,
    Customer,
    Discount,
    Email,
    Feedback,
    Image,
    Order,
    OrderItem,
    Phone,
    Plant,
    Role,
    Sku,
    Task
]

export default makeSchema({
    types: [
        Query,
        Mutation,
        DateTime,
        Upload,
        File,
        Schemas.map(s => Object.values(s)).flat(2)
    ].flat(2),
    outputs: {
        schema: `${process.env.PROJECT_DIR}/packages/server/src/schema.graphql`,
        typegen: `${process.env.PROJECT_DIR}/packages/server/nexus.ts`,
    },
    sourceTypes: {
        modules: [
            {
                module: '@prisma/client',
                alias: 'prisma',
            },
        ],
    },
})