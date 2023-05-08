
/**
 * Reveals absolute path in
 * @param path
 */
export function revealInFolder(path: string) {
    const fileExplorer = this.app.internalPlugins.getPluginById('file-explorer').instance
    if (fileExplorer) {
        const fileObject = this.app.vault.getAbstractFileByPath(path)
        fileExplorer.revealInFolder(fileObject)
    }
}

