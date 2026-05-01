import lumeCMS from 'lume/cms/mod.ts';
import Fs from 'lume/cms/storage/fs.ts';
import GitHub from 'lume/cms/storage/github.ts';
import AuthGitHub from 'lume/cms/auth/github.ts';

import { description, title as name } from './src/common.ts';

const cms = lumeCMS({
    site: {
        name,
        description,
    },
});

// FS fallback/default
cms.storage('fs', Fs.create(''));

const authGitHubProvider = new AuthGitHub({
    authSecret: Deno.env.get('AUTH_SECRET'),
    clientId: Deno.env.get('GITHUB_CLIENT_ID'),
    clientSecret: Deno.env.get('GITHUB_CLIENT_SECRET'),
});
authGitHubProvider.addEventListener('authentication', (ev) => {
    const token = ev.detail.authentication.token;
    const repo = Deno.env.get('GITHUB_REPO');
    if (token && repo) {
        cms.storage('fs', GitHub.create(repo, token));
        // Reinitialize the CMS :/
        cms.fetch = cms.init().fetch;
    }
});
cms.auth(
    Object.fromEntries(
        Deno.env.get('ADMIN_USERS').split(',').map((user) => [user, '']),
    ),
    authGitHubProvider,
);

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
