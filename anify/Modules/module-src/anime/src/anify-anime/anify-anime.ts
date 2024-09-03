import {
    BaseModule,
    InfoData,
    SearchResult,
    VideoContent,
    MediaList,
    Status,
    MediaType,
    ModuleSettings,
    ModuleType,
    InputTypes,
    InputSetting,
    DiscoverData,
    SeasonData,
    DiscoverListing,
    DiscoverTypes,
    MediaPagination,
    MediaDataType,
    SubtitleType,
    MediaInfo,
    SourceList,
    MediaStream,
    SourceData,
} from "../types";
import { Anime, EpisodeData, MediaStatus, ProviderType, Seasonal, Source } from "./types";

export default class AnifyAnimeModule extends BaseModule implements VideoContent {
    baseUrl = "https://anify.eltik.cc";

    metadata = {
        id: "anify-anime",
        name: "Anify Anime",
        author: "Eltik",
        description: "Chouten module for Anify.",
        type: ModuleType.Source,
        subtypes: ["Anime"],
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

        const resp = await request(`${this.baseUrl}/seasonal?type=anime&fields=[id,description,bannerImage,coverImage,title,genres,format,averageRating,totalEpisodes,totalChapters,year,type]`, "GET");
        const json: Seasonal = JSON.parse(resp.body);

        const trending = this.transformDiscoverData(json.trending);
        const seasonal = this.transformDiscoverData(json.seasonal);
        const top = this.transformDiscoverData(json.top);
        const popular = this.transformDiscoverData(json.popular);

        if (json.trending.length > 0) {
            data.push({
                data: trending,
                title: "Currently Trending",
                type: DiscoverTypes.CAROUSEL,
            });
        }

        if (json.seasonal.length > 0) {
            data.push({
                data: seasonal,
                title: "This Season",
                type: DiscoverTypes.GRID_2x,
            });
        }

        if (json.top.length > 0) {
            data.push({
                data: top,
                title: "Highest Rated",
                type: DiscoverTypes.GRID_2x,
            });
        }

        if (json.popular.length > 0) {
            data.push({
                data: popular,
                title: "Popular",
                type: DiscoverTypes.GRID_2x,
            });
        }

        return data;
    }

    transformDiscoverData(data: Anime[]): DiscoverListing[] {
        const results: DiscoverListing[] = data.map((item) => {
            return {
                url: `${this.baseUrl}/info/${item.id}`,
                description: item.description ?? "No description found.",
                indicator: String(item.averageRating ?? 0),
                poster: item.coverImage ?? item.bannerImage ?? "",
                titles: {
                    primary: item.title.english ?? item.title.romaji ?? item.title.native ?? "",
                    secondary: item.title.romaji ?? item.title.native ?? item.title.english ?? "",
                },
                current: item.currentEpisode ?? 0,
                total: item.totalEpisodes ?? 0,
            } as DiscoverListing;
        });

        return results;
    }

    async search(query: string, page: number): Promise<SearchResult> {
        const resp = await request(`${this.baseName}/search?type=anime&query=${encodeURIComponent(query)}&page=${page}`, "GET");
        const json: {
            results: Anime[];
            total: number;
            lastPage: number;
        } = JSON.parse(resp.body);

        return {
            info: {
                pages: json.lastPage ?? 1,
            },
            results: json.results.map((item) => {
                return {
                    url: `${this.baseName}/info/${item.id}`,
                    titles: {
                        primary: item.title.english ?? item.title.romaji ?? item.title.native ?? "",
                        secondary: item.title.romaji ?? item.title.native ?? item.title.english ?? "",
                    },
                    poster: item.coverImage ?? item.bannerImage ?? "",
                    indicator: String(item.averageRating ?? 0),
                    current: item.currentEpisode ?? 0,
                    total: item.totalEpisodes ?? 0,
                };
            }),
        };
    }

    async info(url: string): Promise<InfoData> {
        const resp = await request(url, "GET");
        const json: Anime = JSON.parse(resp.body);

        const episodesp = await request(`${this.baseName}/episodes/${json.id}`, "GET");
        const episodesData: EpisodeData[] = JSON.parse(episodesp.body);

        const seasons: SeasonData[] = [];
        for (const mapping of json.mappings) {
            const episodes = episodesData.filter((episode) => episode.providerId === mapping.providerId);
            if (!episodes[0] || episodes[0]?.episodes.length === 0) continue;

            if (mapping.providerType === ProviderType.ANIME || mapping.providerId === ProviderType.MANGA) {
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
            mediaType: MediaType.EPISODES,
            seasons,
        };

        return data;
    }

    async media(url: string): Promise<MediaList[]> {
        const id = url.split("/")[0];
        const providerId = url.split("/")[1];

        const resp = await request(`${this.baseName}/episodes/${id}`, "GET");
        const json: EpisodeData[] = JSON.parse(resp.body);

        const data: MediaList[] = [];

        for (const provider of json) {
            if (provider.providerId !== providerId) continue;

            const items: MediaInfo[] = [];

            for (const item of provider.episodes) {
                items.push({
                    title: item.title ?? `Episode ${item.number}`,
                    number: item.number,
                    url: `${id}-${this.base64Encode(provider.providerId)}-${this.base64Encode(item.id)}-${item.number}`,
                    thumbnail: item.img ?? undefined,
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
            console.log("Error fetching episodes. Content length is zero.");
            console.log(`Episode response length: ${json.length}`);
            console.log(JSON.stringify(json));
        }

        return data;
    }

    async sources(url: string): Promise<SourceList[]> {
        const sources: SourceData[] = [
            {
                name: "Default",
                url,
            },
        ];

        return [
            {
                title: "Anify",
                sources,
            },
        ];
    }

    async streams(url: string): Promise<MediaStream> {
        const data: MediaStream = {
            streams: [],
            skips: [],
            subtitles: [],
            previews: [],
        };

        const id = url.split("-")[0];
        const providerId = this.base64Decode(url.split("-")[1]);
        const watchId = this.base64Decode(url.split("-")[2]);
        const episodeNumber = url.split("-")[3];

        const resp = await request(`${this.baseName}/sources?id=${id}&providerId=${providerId}&watchId=${watchId}&episodeNumber=${episodeNumber}&subType=sub`, "GET");
        const json: Source = JSON.parse(resp.body);
        console.log(JSON.stringify(json));

        if (json.intro.end > 0) {
            data.skips.push({
                title: "Intro",
                start: json.intro.start,
                end: json.intro.end,
            });
        }
        if (json.outro.end > 0) {
            data.skips.push({
                title: "Outro",
                start: json.outro.start,
                end: json.outro.end,
            });
        }

        for (const source of json.sources) {
            data.streams.push({
                file: source.url,
                quality: source.quality,
                type: MediaDataType.HLS,
            });
        }

        for (const subtitle of json.subtitles) {
            data.subtitles.push({
                url: subtitle.url,
                language: subtitle.lang,
                type: SubtitleType.VTT,
            });
        }

        return data;
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
