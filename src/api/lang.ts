export default interface Lang {
    name: string,
    google: string,
    baidu: string,
    tencent: string,
    mymemory: string,
    uapis: string,
    azure: string
}

export const lang = {
    chinese: {
        name: '中文',
        google: 'zh-CN',
        baidu: 'zh',
        tencent: 'zh',
        mymemory: 'zh-CN',
        uapis: 'zh',
        azure: 'zh-Hans'
    },
    english: {
        name: '英语',
        google: 'en',
        baidu: 'en',
        tencent: 'en',
        mymemory: 'en',
        uapis: 'en',
        azure: 'en'
    },
    japanese: {
        name: '日语',
        google: 'ja',
        baidu: 'jp',
        tencent: 'jp',
        mymemory: 'ja',
        uapis: 'ja',
        azure: 'ja'
    }
}