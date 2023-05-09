import { existsSync, mkdirSync } from "fs";
import { Notice, TAbstractFile } from "obsidian";
import path from "path";

export const DEFAULT_EXPORT_PATH = "~/obsidian-output"

/**
 * Takes the currently viewed elements, and exports them.
 * TODO:
 * - saves a dump of their MD5 hash, so we can later compare whether they've been modified.
 */
export async function exportSelection(fileList: Array<TAbstractFile>) {
    // Check if target directory exists
    const outputFolder = this.app.plugins.plugins['meta-dataview'].settings.outputFolder || DEFAULT_EXPORT_PATH
    new Notice("Export to " + outputFolder);
    const groupBy = this.app.plugins.plugins['meta-dataview'].settings.groupBy || false

    if (!existsSync(outputFolder)) {
        mkdirSync(outputFolder)
    }
    fileList.forEach(async (file) => {
        await convertAndCopy(outputFolder, groupBy, file)
    })
    console.warn('exporting', fileList)
    new Notice("Exported to " + outputFolder);
}

export async function convertAndCopy(rootPath: string, groupBy: string, fileDescriptor: TAbstractFile) {
    let targetDir = path.normalize(rootPath);
    if (groupBy) {
        if (fileDescriptor.frontmatter && fileDescriptor.frontmatter[groupBy]){
            targetDir = path.join(targetDir, fileDescriptor.frontmatter[groupBy])
        }
    }
    const targetFileName = path.join(targetDir, fileDescriptor.name + '.' + fileDescriptor.ext)

    // TODO: This does not work, it should read the file content
    const fileContent = await this.app.adapter.read(fileDescriptor.path)

    // TODO: Get the linked images out
    // TODO: copy the images to the target assets folder
    /**
     * TODO
     * - check the links
     * - if they are pointing to another post within: replace them
     * - if they are not, erase link.
     */

    // TODO: save MD5 hash of the file into a last exported json e.g. in the target dir
    // AND persist it into LS, or plugin data

    console.log(targetFileName, fileContent)
}