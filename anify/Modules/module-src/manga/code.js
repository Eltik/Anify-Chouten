"use strict";
var source = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/anify-manga/anify-manga.ts
  var anify_manga_exports = {};
  __export(anify_manga_exports, {
    default: () => AnifyMangaModule
  });

  // src/types.ts
  var BaseModule = class {
    /**
     * Update the value of a setting with a given ID
     *
     * @param settingId - The ID of the setting to update
     * @param newValue - The new value for the setting
     */
    updateSettingValue(settingId, newValue) {
      this.settings.forEach((group) => {
        const settingToUpdate = group.settings.find((setting) => setting.id === settingId);
        if (settingToUpdate) {
          if (typeof settingToUpdate.value == typeof newValue) {
            settingToUpdate.value = newValue;
          }
        }
      });
    }
    /**
     * Retrieve the value of a given setting
     *
     * @param settingId The ID of the setting to retrieve
     */
    getSettingValue(settingId) {
      this.settings.forEach((group) => {
        var _a;
        return (_a = group.settings.find((setting) => setting.id === settingId)) == null ? void 0 : _a.value;
      });
    }
  };

  // src/anify-manga/anify-manga.ts
  var AnifyMangaModule = class extends BaseModule {
    constructor() {
      super(...arguments);
      this.baseUrl = "https://anify.eltik.cc";
      this.metadata = {
        id: "anify-manga",
        name: "Anify Manga",
        author: "Eltik",
        description: "Chouten module for Anify.",
        type: 0 /* Source */,
        subtypes: ["Manga"],
        version: "0.0.1"
      };
      this.settings = [
        {
          title: "General",
          settings: [
            {
              id: "Domain",
              label: "Domain",
              placeholder: "https://anify.eltik.cc",
              defaultValue: "https://anify.eltik.cc",
              value: "https://anify.eltik.cc"
            }
          ]
        }
      ];
      this.baseName = this.baseUrl;
    }
    async discover() {
      const data = [];
      const resp = await request("".concat(this.baseUrl, "/seasonal?type=manga&fields=[id,description,bannerImage,coverImage,title,genres,format,averageRating,totalEpisodes,totalChapters,year,type]"), "GET");
      const json = JSON.parse(resp.body);
      data.push(
        {
          data: json.trending.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
            return {
              url: "".concat(this.baseUrl, "/info/").concat(item.id),
              description: (_a = item.description) != null ? _a : "No description found.",
              indicator: String((_b = item.averageRating) != null ? _b : 0),
              poster: (_d = (_c = item.coverImage) != null ? _c : item.bannerImage) != null ? _d : "",
              titles: {
                primary: (_g = (_f = (_e = item.title.english) != null ? _e : item.title.romaji) != null ? _f : item.title.native) != null ? _g : "",
                secondary: (_j = (_i = (_h = item.title.romaji) != null ? _h : item.title.native) != null ? _i : item.title.english) != null ? _j : ""
              },
              total: (_k = item.totalChapters) != null ? _k : 0
            };
          }),
          title: "Currently Trending",
          type: 0 /* CAROUSEL */
        },
        {
          data: json.seasonal.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
            return {
              url: "".concat(this.baseUrl, "/info/").concat(item.id),
              description: (_a = item.description) != null ? _a : "No description found.",
              indicator: String((_b = item.averageRating) != null ? _b : 0),
              poster: (_d = (_c = item.coverImage) != null ? _c : item.bannerImage) != null ? _d : "",
              titles: {
                primary: (_g = (_f = (_e = item.title.english) != null ? _e : item.title.romaji) != null ? _f : item.title.native) != null ? _g : "",
                secondary: (_j = (_i = (_h = item.title.romaji) != null ? _h : item.title.native) != null ? _i : item.title.english) != null ? _j : ""
              },
              total: (_k = item.totalChapters) != null ? _k : 0
            };
          }),
          title: "This Season",
          type: 2 /* GRID_2x */
        },
        {
          data: json.top.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
            return {
              url: "".concat(this.baseUrl, "/info/").concat(item.id),
              description: (_a = item.description) != null ? _a : "No description found.",
              indicator: String((_b = item.averageRating) != null ? _b : 0),
              poster: (_d = (_c = item.coverImage) != null ? _c : item.bannerImage) != null ? _d : "",
              titles: {
                primary: (_g = (_f = (_e = item.title.english) != null ? _e : item.title.romaji) != null ? _f : item.title.native) != null ? _g : "",
                secondary: (_j = (_i = (_h = item.title.romaji) != null ? _h : item.title.native) != null ? _i : item.title.english) != null ? _j : ""
              },
              total: (_k = item.totalChapters) != null ? _k : 0
            };
          }),
          title: "Highest Rated",
          type: 2 /* GRID_2x */
        },
        {
          data: json.popular.map((item) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
            return {
              url: "".concat(this.baseUrl, "/info/").concat(item.id),
              description: (_a = item.description) != null ? _a : "No description found.",
              indicator: String((_b = item.averageRating) != null ? _b : 0),
              poster: (_d = (_c = item.coverImage) != null ? _c : item.bannerImage) != null ? _d : "",
              titles: {
                primary: (_g = (_f = (_e = item.title.english) != null ? _e : item.title.romaji) != null ? _f : item.title.native) != null ? _g : "",
                secondary: (_j = (_i = (_h = item.title.romaji) != null ? _h : item.title.native) != null ? _i : item.title.english) != null ? _j : ""
              },
              total: (_k = item.totalChapters) != null ? _k : 0
            };
          }),
          title: "Popular",
          type: 2 /* GRID_2x */
        }
      );
      return data;
    }
    async search(query, page) {
      var _a;
      const resp = await request("".concat(this.baseName, "/search?type=manga&query=").concat(encodeURIComponent(query), "&page=").concat(page), "GET");
      const json = JSON.parse(resp.body);
      return {
        info: {
          pages: (_a = json.lastPage) != null ? _a : 1
        },
        results: json.results.map((item) => {
          var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
          return {
            url: "".concat(this.baseUrl, "/info/").concat(item.id),
            description: (_a2 = item.description) != null ? _a2 : "No description found.",
            indicator: String((_b = item.averageRating) != null ? _b : 0),
            poster: (_d = (_c = item.coverImage) != null ? _c : item.bannerImage) != null ? _d : "",
            titles: {
              primary: (_g = (_f = (_e = item.title.english) != null ? _e : item.title.romaji) != null ? _f : item.title.native) != null ? _g : "",
              secondary: (_j = (_i = (_h = item.title.romaji) != null ? _h : item.title.native) != null ? _i : item.title.english) != null ? _j : ""
            },
            total: (_k = item.totalChapters) != null ? _k : 0
          };
        })
      };
    }
    async info(url) {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
      const resp = await request(url, "GET");
      const json = JSON.parse(resp.body);
      const chaptersp = await request("".concat(this.baseName, "/chapters/").concat(json.id), "GET");
      const chaptersData = JSON.parse(chaptersp.body);
      const seasons = [];
      for (const mapping of json.mappings) {
        const chapters = chaptersData.filter((chapter) => chapter.providerId === mapping.providerId);
        if (!chapters[0] || ((_a = chapters[0]) == null ? void 0 : _a.chapters.length) === 0)
          continue;
        if (mapping.providerType === "MANGA" /* MANGA */) {
          seasons.push({
            name: mapping.providerId,
            url: "".concat(json.id, "/").concat(mapping.providerId),
            selected: seasons.length === 0
          });
        }
      }
      const data = {
        titles: {
          primary: (_d = (_c = (_b = json.title.english) != null ? _b : json.title.romaji) != null ? _c : json.title.native) != null ? _d : "",
          secondary: (_g = (_f = (_e = json.title.romaji) != null ? _e : json.title.native) != null ? _f : json.title.english) != null ? _g : ""
        },
        altTitles: [],
        description: (_h = json.description) != null ? _h : "No description found.",
        poster: (_j = (_i = json.coverImage) != null ? _i : json.bannerImage) != null ? _j : "",
        banner: (_l = (_k = json.bannerImage) != null ? _k : json.coverImage) != null ? _l : "",
        status: this.parseStatus((_m = json.status) != null ? _m : "NOT_YET_RELEASED" /* NOT_YET_RELEASED */),
        rating: json.averageRating,
        yearReleased: (_n = json.year) != null ? _n : 2024,
        mediaType: 1 /* CHAPTERS */,
        seasons
      };
      return data;
    }
    async media(url) {
      var _a;
      const id = url.split("/")[0];
      const providerId = url.split("/")[1];
      const resp = await request("".concat(this.baseName, "/chapters/").concat(id), "GET");
      const json = JSON.parse(resp.body);
      const data = [];
      for (const provider of json) {
        if (provider.providerId !== providerId)
          continue;
        const items = [];
        for (const item of provider.chapters) {
          items.push({
            title: (_a = item.title) != null ? _a : "Chapter ".concat(item.number),
            number: item.number,
            url: "".concat(this.base64Encode(id), "-").concat(this.base64Encode(provider.providerId), "-").concat(this.base64Encode(item.id), "-").concat(item.number)
          });
        }
        const pagination = [
          {
            id: "".concat(id, "-").concat(provider.providerId),
            items,
            title: "".concat(id, "-").concat(provider.providerId)
          }
        ];
        data.push({
          title: provider.providerId,
          pagination
        });
      }
      if (data.length === 0) {
        console.log("Error fetching chapters. Content length is zero.");
        console.log("Chapters response length: ".concat(json.length));
        console.log(JSON.stringify(json));
      }
      return data;
    }
    async pages(url) {
      const id = this.base64Decode(url.split("-")[0]);
      const providerId = this.base64Decode(url.split("-")[1]);
      const readId = this.base64Decode(url.split("-")[2]);
      const chapterNumber = url.split("-")[3];
      const resp = await request("".concat(this.baseName, "/pages?id=").concat(id, "&providerId=").concat(providerId, "&readId=").concat(readId, "&chapterNumber=").concat(chapterNumber), "GET");
      const json = JSON.parse(resp.body);
      return json.map((item) => item.url);
    }
    parseStatus(status) {
      switch (status) {
        case "FINISHED" /* FINISHED */:
          return 0 /* COMPLETED */;
        case "RELEASING" /* RELEASING */:
          return 1 /* CURRENT */;
        case "NOT_YET_RELEASED" /* NOT_YET_RELEASED */:
          return 3 /* NOT_RELEASED */;
        case "HIATUS" /* HIATUS */:
          return 2 /* HIATUS */;
        default:
          return 4 /* UNKNOWN */;
      }
    }
    base64Encode(input) {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      const str = input;
      let output = "";
      for (let block = 0, charCode, i = 0, map = chars; str.charAt(i | 0) || (map = "=", i % 1); output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
        charCode = str.charCodeAt(i += 3 / 4);
        if (charCode > 255) {
          throw new Error("'customBtoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
      }
      return output;
    }
    base64Decode(input) {
      const base64abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let decoded = "";
      input = input.replace(/[^A-Za-z0-9+/=]/g, "");
      for (let i = 0; i < input.length; ) {
        const enc1 = base64abc.indexOf(input.charAt(i++));
        const enc2 = base64abc.indexOf(input.charAt(i++));
        const enc3 = base64abc.indexOf(input.charAt(i++));
        const enc4 = base64abc.indexOf(input.charAt(i++));
        const chr1 = enc1 << 2 | enc2 >> 4;
        const chr2 = (enc2 & 15) << 4 | enc3 >> 2;
        const chr3 = (enc3 & 3) << 6 | enc4;
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
  };
  return __toCommonJS(anify_manga_exports);
})();
