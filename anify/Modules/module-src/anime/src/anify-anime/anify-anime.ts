import { BaseModule, InfoData, SearchResult, VideoContent, MediaList, Status, MediaType, MediaSource, ModuleSettings, ModuleType, InputTypes, InputSetting, ServerList, DiscoverData, SeasonData, ServerData, MediaDataType, SearchData, DiscoverListing, DiscoverTypes, MediaPagination } from "../types";
import { load } from "cheerio";
import { parseSkipData } from "./utils/skipData";
import { decodeVideoSkipData, getVrf } from "./utils/urlGrabber";
import { getVideo } from "./extractor";
import { AJAX_BASENAME } from "./utils/variables";
import { Anime, EpisodeData, MediaStatus, ProviderType, Seasonal } from "./types";

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
                        current: item.currentEpisode ?? 0,
                        total: item.totalEpisodes ?? 0,
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
                        current: item.currentEpisode ?? 0,
                        total: item.totalEpisodes ?? 0,
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
                        current: item.currentEpisode ?? 0,
                        total: item.totalEpisodes ?? 0,
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
                        current: item.currentEpisode ?? 0,
                        total: item.totalEpisodes ?? 0,
                    } satisfies DiscoverListing;
                }),
                title: "Popular",
                type: DiscoverTypes.GRID_2x,
            },
        );

        return data;
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
                    title: item.title.english ?? item.title.romaji ?? item.title.native ?? "",
                    indicator: String(item.averageRating ?? 0),
                    poster: item.coverImage ?? item.bannerImage ?? "",
                    url: `${this.baseName}/info/${item.id}`,
                    current: item.currentEpisode ?? 0,
                    total: item.totalEpisodes ?? 0,
                };
            }),
        };
    }

    async info(url: string): Promise<InfoData> {
        const resp = await request(url, "GET");
        const json: Anime = JSON.parse(resp.body);

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
            seasons: json.mappings
                .map((mapping) => {
                    if (mapping.providerType === ProviderType.ANIME || mapping.providerId === ProviderType.MANGA) {
                        return {
                            name: mapping.providerId,
                            url: `${json.id}/${mapping.providerId}`,
                        };
                    } else {
                        return null;
                    }
                })
                .filter(Boolean) as SeasonData[],
        };

        return data;
    }

    async media(url: string): Promise<MediaList[]> {
        const id = url.split("/")[0];
        const providerId = url.split("/")[1];

        const resp = await request(`${this.baseName}/episodes/${id}`, "GET");
        const json: EpisodeData[] = JSON.parse(resp.body);

        const data: MediaList[] = [];

        const chunkArray = <T>(arr: T[], chunkSize: number): T[][] => {
            const result: T[][] = [];
            for (let i = 0; i < arr.length; i += chunkSize) {
                result.push(arr.slice(i, i + chunkSize));
            }
            return result;
        };

        for (const provider of json) {
            if (provider.providerId !== providerId) continue;

            const pagination: MediaPagination[] = [];

            const episodeChunks = chunkArray(provider.episodes, 4);
            for (let i = 0; i < episodeChunks.length; i++) {
                pagination.push({
                    id: `${id}-${provider.providerId}-${i}`,
                    items: episodeChunks[i].map((episode) => {
                        return {
                            title: episode.title ?? `Episode ${episode.number}`,
                            number: episode.number,
                            url: `${id}-${provider.providerId}-${episode.id}-${episode.number}`,
                            thumbnail: episode.img ?? undefined,
                        };
                    }),
                    title: `${id}-${provider.providerId}-${i}`,
                });
            }

            data.push({
                title: provider.providerId,
                pagination,
            });
        }

        console.log(JSON.stringify(data));

        return data;
    }

    async servers(_url: string): Promise<ServerList[]> {
        const [episodeId, variantType] = _url.split(" | ");

        const html = await request(`${AJAX_BASENAME}/server/list/${episodeId}?vrf=${getVrf(episodeId)}`, "GET");

        const json = JSON.parse(html.body);

        const $ = load(json["result"]);

        // TODO- TEST: I THINK I FUCKED SMTH UP NOT SURE
        const servers: ServerData[] = $(".type")
            .map((_, serverCategory) => {
                const categoryRef = $(serverCategory);
                // const sourceType = categoryRef.find("label").text().trim()
                const sourceType = categoryRef.attr("data-type");
                if (sourceType != variantType) return undefined;

                return categoryRef
                    .find("ul")
                    .find("li")
                    .map((_, server) => {
                        const serverRef = $(server);
                        const serverName = serverRef.text();
                        const linkId = serverRef.attr("data-link-id")!;
                        return {
                            name: `${serverName}`,
                            url: linkId,
                        } satisfies ServerData;
                    })
                    .get();
            })
            .get();

        return [
            {
                title: "Aniwave",
                servers: servers,
            } satisfies ServerList,
        ];
    }

    async sources(_url: string): Promise<MediaSource> {
        try {
            let data = await request(`${AJAX_BASENAME}/server/${_url}?vrf=${getVrf(_url)}`, "GET");

            if (data.statusCode != 200) {
                // @ts-ignore
                await callWebview(`${AJAX_BASENAME}/server/${_url}?vrf=${getVrf(_url)}`);
                data = await request(`${AJAX_BASENAME}/server/${_url}?vrf=${getVrf(_url)}`, "GET");
            }

            const result = JSON.parse(data.body)["result"];
            const url = decodeVideoSkipData(result["url"]);
            const skipData = parseSkipData(decodeVideoSkipData(result["skip_data"]));

            const sourceData = await getVideo(url);
            const videos = sourceData.videos;

            const mediaSource: MediaSource = {
                sources: videos.map((video) => ({
                    quality: video.quality ?? "auto",
                    file: video.url,
                    type: MediaDataType.HLS,
                })),
                skips: skipData,
                subtitles: sourceData.subtitles ?? [],
                previews: [], // Pretty sure Aniwave doesn't send those.
            };

            console.log(`${mediaSource}`);

            return mediaSource;
        } catch (error) {
            console.error(`${error}`);
        }
        throw "Streams failed.";
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
}
