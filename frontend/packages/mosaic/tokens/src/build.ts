import { StyleDictionary } from 'style-dictionary-utils'

const themes = ['octopus', 'mantle']
const modes = ['light', 'dark']

for (const theme of themes) {
    for (const mode of modes) {
        const sd = new StyleDictionary()
        const extended = await sd.extend({
            source: [
                'src/foundation/**/*.json',
                `src/semantic/*.json`,
                `src/semantic/themes/${theme}/*.json`,
                `src/semantic/themes/${theme}/${mode}.json`,
                'src/component/**/*.json',
            ],
            platforms: {
                css: {
                    prefix: 'mds',
                    buildPath: './dist/css/',
                    transformGroup: 'css/extended',
                    colorOutputFormat: 'hsl',
                    outputUnit: 'rem',
                    files: [
                        {
                            format: 'css/advanced',
                            destination: `${theme}-${mode}.css`,
                            options: {
                                selector: `[data-theme="${theme}-${mode}"]`,
                            },
                        },
                    ],
                },
                js: {
                    buildPath: './dist/json/',
                    transformGroup: 'js',
                    files: [
                        {
                            format: 'json/nested',
                            destination: `${theme}-${mode}.json`,
                            filter: (token) => token.filePath.startsWith('src/semantic/'),
                        },
                    ],
                },
            },
        })
        await extended.cleanAllPlatforms()
        await extended.buildAllPlatforms()
    }
}
