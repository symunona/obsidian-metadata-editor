
/**
 * @param str
 * @returns
 */
export function isHttpUrl(str: any): boolean {
    if (str instanceof String) {
        return str.startsWith('http://') || str.startsWith('https://')
    }
    return false
}

export function createLink(leaf:HTMLElement, url: string, name?: string, title?: string){
    return leaf.createEl('a', {
        attr:{ href: url, title: title || null },
        text: name || url
    })
}