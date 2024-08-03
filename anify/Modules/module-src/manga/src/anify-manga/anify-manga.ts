import { BaseModule, InfoData, SearchResult, MediaList, Status, MediaType, ModuleSettings, ModuleType, InputTypes, InputSetting, DiscoverData, SeasonData, DiscoverListing, DiscoverTypes, MediaPagination, MediaInfo, BookContent } from "../types";
import { ChapterData, Manga, MediaStatus, Page, ProviderType, Seasonal } from "./types";

export default class AnifyMangaModule extends BaseModule implements BookContent {
    baseUrl = "https://anify.eltik.cc";

    metadata = {
        id: "anify-manga",
        name: "Anify Manga",
        author: "Eltik",
        description: "Chouten module for Anify.",
        type: ModuleType.Source,
        subtypes: ["Manga"],
        version: "0.0.1",
    };

    settings: ModuleSettings = [
        {
            title: "General",
            settings: [
                {
                    id: "Domain",
                    label: "Domain",
                    placeholder: "https://anify.eltik.cc",
                    defaultValue: "https://anify.eltik.cc",
                    value: "https://anify.eltik.cc",
                } as InputSetting<InputTypes.URL>,
            ],
        },
    ];

    baseName: string = this.baseUrl;

    async discover(): Promise<DiscoverData> {
        const data: DiscoverData = [];

        const resp = await request(`${this.baseUrl}/seasonal?type=manga&fields=[id,description,bannerImage,coverImage,title,genres,format,averageRating,totalEpisodes,totalChapters,year,type]`, "GET");
        const json: Seasonal = JSON.parse(resp.body);

        data.push(
            {
                data: json.trending.map((item) => {
                    return {
                        url: `${this.baseUrl}/info/${item.id}`,
                        description: item.description ?? "No description found.",
                        indicator: String(item.averageRating ?? 0),
                        poster: item.coverImage ?? item.bannerImage ?? "",
                        titles: {
                            primary: item.title.english ?? item.title.romaji ?? item.title.native ?? "",
                            secondary: item.title.romaji ?? item.title.native ?? item.title.english ?? "",
                        },
                        total: item.totalChapters ?? 0,
                    } satisfies DiscoverListing;
                }),
                title: "Currently Trending",
                type: DiscoverTypes.CAROUSEL,
            },
            {
                data: json.seasonal.map((item) => {
                    return {
                        url: `${this.baseUrl}/info/${item.id}`,
                        description: item.description ?? "No description found.",
                        indicator: String(item.averageRating ?? 0),
                        poster: item.coverImage ?? item.bannerImage ?? "",
                        titles: {
                            primary: item.title.english ?? item.title.romaji ?? item.title.native ?? "",
                            secondary: item.title.romaji ?? item.title.native ?? item.title.english ?? "",
                        },
                        total: item.totalChapters ?? 0,
                    } satisfies DiscoverListing;
                }),
                title: "This Season",
                type: DiscoverTypes.GRID_2x,
            },
            {
                data: json.top.map((item) => {
                    return {
                        url: `${this.baseUrl}/info/${item.id}`,
                        description: item.description ?? "No description found.",
                        indicator: String(item.averageRating ?? 0),
                        poster: item.coverImage ?? item.bannerImage ?? "",
                        titles: {
                            primary: item.title.english ?? item.title.romaji ?? item.title.native ?? "",
                            secondary: item.title.romaji ?? item.title.native ?? item.title.english ?? "",
                        },
                        total: item.totalChapters ?? 0,
                    } satisfies DiscoverListing;
                }),
                title: "Highest Rated",
                type: DiscoverTypes.GRID_2x,
            },
            {
                data: json.popular.map((item) => {
                    return {
                        url: `${this.baseUrl}/info/${item.id}`,
                        description: item.description ?? "No description found.",
                        indicator: String(item.averageRating ?? 0),
                        poster: item.coverImage ?? item.bannerImage ?? "",
                        titles: {
                            primary: item.title.english ?? item.title.romaji ?? item.title.native ?? "",
                            secondary: item.title.romaji ?? item.title.native ?? item.title.english ?? "",
                        },
                        total: item.totalChapters ?? 0,
                    } satisfies DiscoverListing;
                }),
                title: "Popular",
                type: DiscoverTypes.GRID_2x,
            },
        );

        return data;
    }

    async search(query: string, page: number): Promise<SearchResult> {
        const resp = await request(`${this.baseName}/search?type=manga&query=${encodeURIComponent(query)}&page=${page}`, "GET");
        const json: {
            results: Manga[];
            total: number;
            lastPage: number;
        } = JSON.parse(resp.body);

        return {
            info: {
                pages: json.lastPage ?? 1,
            },
            results: json.results.map((item) => {
                return {
                    url: `${this.baseUrl}/info/${item.id}`,
                    description: item.description ?? "No description found.",
                    indicator: String(item.averageRating ?? 0),
                    poster: item.coverImage ?? item.bannerImage ?? "",
                    titles: {
                        primary: item.title.english ?? item.title.romaji ?? item.title.native ?? "",
                        secondary: item.title.romaji ?? item.title.native ?? item.title.english ?? "",
                    },
                    total: item.totalChapters ?? 0,
                };
            }),
        };
    }

    async info(url: string): Promise<InfoData> {
        const resp = await request(url, "GET");
        const json: Manga = JSON.parse(resp.body);

        const chaptersp = await request(`${this.baseName}/chapters/${json.id}`, "GET");
        const chaptersData: ChapterData[] = JSON.parse(chaptersp.body);

        const seasons: SeasonData[] = [];
        for (const mapping of json.mappings) {
            const chapters = chaptersData.filter((chapter) => chapter.providerId === mapping.providerId);
            if (!chapters[0] || chapters[0]?.chapters.length === 0) continue;

            if (mapping.providerType === ProviderType.MANGA) {
                seasons.push({
                    name: mapping.providerId,
                    url: `${json.id}/${mapping.providerId}`,
                    selected: seasons.length === 0,
                } as SeasonData);
            }
        }

        const data: InfoData = {
            titles: {
                primary: json.title.english ?? json.title.romaji ?? json.title.native ?? "",
                secondary: json.title.romaji ?? json.title.native ?? json.title.english ?? "",
            },
            altTitles: [],
            description: json.description ?? "No description found.",
            poster: json.coverImage ?? json.bannerImage ?? "",
            banner: json.bannerImage ?? json.coverImage ?? "",
            status: this.parseStatus(json.status ?? MediaStatus.NOT_YET_RELEASED),
            rating: json.averageRating,
            yearReleased: json.year ?? 2024,
            mediaType: MediaType.CHAPTERS,
            seasons,
        };

        return data;
    }

    async media(url: string): Promise<MediaList[]> {
        const id = url.split("/")[0];
        const providerId = url.split("/")[1];

        const resp = await request(`${this.baseName}/chapters/${id}`, "GET");
        const json: ChapterData[] = JSON.parse(resp.body);

        const data: MediaList[] = [];

        for (const provider of json) {
            if (provider.providerId !== providerId) continue;

            const items: MediaInfo[] = [];

            for (const item of provider.chapters) {
                items.push({
                    title: item.title ?? `Chapter ${item.number}`,
                    number: item.number,
                    url: `${this.base64Encode(id)}-${this.base64Encode(provider.providerId)}-${this.base64Encode(item.id)}-${item.number}`,
                });
            }

            const pagination: MediaPagination[] = [
                {
                    id: `${id}-${provider.providerId}`,
                    items,
                    title: `${id}-${provider.providerId}`,
                },
            ];

            data.push({
                title: provider.providerId,
                pagination,
            });
        }

        if (data.length === 0) {
            console.log("Error fetching chapters. Content length is zero.");
            console.log(`Chapters response length: ${json.length}`);
            console.log(JSON.stringify(json));
        }

        return data;
    }

    async pages(url: string): Promise<string[]> {
        const id = this.base64Decode(url.split("-")[0]);
        const providerId = this.base64Decode(url.split("-")[1]);
        const readId = this.base64Decode(url.split("-")[2]);
        const chapterNumber = url.split("-")[3];

        const resp = await request(`${this.baseName}/pages?id=${id}&providerId=${providerId}&readId=${readId}&chapterNumber=${chapterNumber}`, "GET");
        const json: Page[] = JSON.parse(resp.body);

        return json.map((item) => item.url);
    }

    private parseStatus(status: MediaStatus): Status {
        switch (status) {
            case MediaStatus.FINISHED:
                return Status.COMPLETED;
            case MediaStatus.RELEASING:
                return Status.CURRENT;
            case MediaStatus.NOT_YET_RELEASED:
                return Status.NOT_RELEASED;
            case MediaStatus.HIATUS:
                return Status.HIATUS;
            default:
                return Status.UNKNOWN;
        }
    }

    private base64Encode(input: string): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        const str = input;
        let output = "";

        for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || ((map = "="), i % 1); output += map.charAt(63 & (block >> (8 - (i % 1) * 8)))) {
            charCode = str.charCodeAt((i += 3 / 4));

            if (charCode > 0xff) {
                throw new Error("'customBtoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
            }

            block = (block << 8) | charCode;
        }

        return output;
    }

    private base64Decode(input: string): string {
        const base64abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        let decoded = "";

        // Remove any characters not in the base64 characters list
        input = input.replace(/[^A-Za-z0-9+/=]/g, "");

        for (let i = 0; i < input.length; ) {
            const enc1 = base64abc.indexOf(input.charAt(i++));
            const enc2 = base64abc.indexOf(input.charAt(i++));
            const enc3 = base64abc.indexOf(input.charAt(i++));
            const enc4 = base64abc.indexOf(input.charAt(i++));

            const chr1 = (enc1 << 2) | (enc2 >> 4);
            const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            const chr3 = ((enc3 & 3) << 6) | enc4;

            decoded += String.fromCharCode(chr1);

            if (enc3 !== 64) {
                decoded += String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                decoded += String.fromCharCode(chr3);
            }
        }

        return decoded;
    }
}
