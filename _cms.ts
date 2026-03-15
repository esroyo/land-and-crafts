import lumeCMS from 'lume/cms/mod.ts';
import Fs from 'lume/cms/storage/fs.ts';
import GitHub from 'lume/cms/storage/github.ts';

import { description, title as name } from './src/common.ts';

const cms = lumeCMS({
    site: {
        name,
        description,
    },
});

const user = Deno.env.get('ADMIN_USERNAME') || 'admin';
const password = Deno.env.get('ADMIN_PASSWORD') || '';
cms.auth({
    [user]: password,
});

const token = Deno.env.get('GITHUB_TOKEN');
const repo = Deno.env.get('GITHUB_REPO');

const storage = token && repo ? GitHub.create(repo, token) : Fs.create('');
cms.storage('fs', storage);

cms.upload({
    name: 'projects',
    store: 'fs:content/projects/**/*',
});

cms.collection({
    name: 'projects',
    store: 'fs:content/projects/**/index.md',
    fields: [
        {
            name: 'title',
            type: 'text',
        },
        {
            name: 'description',
            label: 'tagline',
            type: 'rich-text',
            relativePath: true,
        },
        {
            name: 'coordinates',
            type: 'text',
            init(field, _content, data) {
                try {
                    if (typeof data[field.name] !== 'string') {
                        data[field.name] = JSON.stringify(data[field.name]);
                    }
                } catch { /* empty */ }
            },
            transform(value) {
                try {
                    return JSON.parse(value);
                } catch {
                    return value;
                }
            },
        },
        {
            name: 'cover',
            type: 'file',
            relativePath: true,
            upload: 'projects:{document_dirname}',
        },
        {
            name: 'content',
            type: 'markdown',
            relativePath: true,
        },
    ],
});

export default cms;
