import { FullIndex } from "obsidian-dataview";
import { dirname } from "path";
import _ from "underscore";

const MAX_ENUM_LENGTH = 50;

export class FolderMeta {
    folderMetaMap: { [path: string]: { [attributeKey: string]: Array<string> } };

    constructor(index: FullIndex) {
        this.createFolderMetaIndex(index);
    }
    createFolderMetaIndex(index: FullIndex) {
        const startTime = new Date();
        this.folderMetaMap = {};
        // console.log('index pages', index.pages)
        index.pages.forEach(file => {
            const folderName = dirname(file.path)
            this.folderMetaMap[folderName] = this.folderMetaMap[folderName] || {};
            const pathEntry = this.folderMetaMap[folderName];
            Object.keys(file.frontmatter).map(attributeKey => {
                const value = file.frontmatter[attributeKey];
                const existingValues = pathEntry[attributeKey] || [];

                this.appendIfQualify(existingValues, value);

                if (_.isArray(value)) {
                    value.forEach((subValue: any) => {
                        this.appendIfQualify(existingValues, subValue);
                    });
                }
                pathEntry[attributeKey] = _.uniq(existingValues);
            });
        });
        console.warn(
			"index built",
			new Date().getUTCMilliseconds() - startTime.getUTCMilliseconds()
		);
    }
    appendIfQualify(array: Array<any>, value: any) {
        if (_.isNumber(value)) {
            array.push(value.toString());
        }
        if (_.isString(value) && value.length < MAX_ENUM_LENGTH) {
            array.push(value);
        }
    }
}
