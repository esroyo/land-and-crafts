import lumeCMS from 'lume/cms/mod.ts';
import Fs from 'lume/cms/storage/fs.ts';

import { description, title as name } from './src/common.ts';

const cms = lumeCMS({
    site: {
        name,
        description,
    },
});

const storage = Fs.create('');
cms.storage('fs', storage);

cms.upload({
    name: 'projects',
    store: 'fs:content/projects',
});

cms.collection({
    name: 'projects',
    store: 'fs:content/projects/*/index.md',
    fields: [
        { name: 'title', type: 'text' },
        {
            name: 'description',
            label: 'tagline',
            type: 'rich-text',
            relativePath: true,
        },
        { name: 'coordinates', type: 'text' },
        {
            name: 'cover',
            type: 'file',
            relativePath: true,
            upload: 'projects:{document_dirname}',
        },
        { name: 'content', relativePath: true, type: 'markdown' },
    ],
});

export default cms;
