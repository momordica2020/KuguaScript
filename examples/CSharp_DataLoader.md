var two_chars_words = "朱砂 天下 杀伐 人家 韶华 风华 繁华 血染 墨染 白衣 素衣 嫁衣 倾城 孤城 空城 旧城 旧人 伊人 心疼 春风 古琴 无情 迷离 奈何 断弦 焚尽 散乱 陌路 乱世 笑靥 浅笑 明眸 轻叹 烟火 一生 三生 浮生 桃花 梨花 落花 烟花 离殇 情殇 爱殇 剑殇 灼伤 仓皇 匆忙 陌上 清商 焚香 墨香 微凉 断肠 痴狂 凄凉 黄梁 未央 成双 无恙 虚妄 凝霜 洛阳 长安 江南 忘川 千年 纸伞 烟雨 回眸 公子 红尘 红颜 红衣 红豆 红线 青丝 青史 青冢 白首 白骨 黄土 黄泉 碧落 紫陌 浅唱 寂灭 无声 邂逅 流年 落寂 叙述 唯爱 晨曦 回忆 错落 迷茫 恬静 默诺 余音 情殇 背殇 落幕 黯然 拾忆 独寂 透彻 水影 浅陌 无垠 似水 流年 深音 铭记 迷遇 暖光 蘩藜 尘宵 磬音 黯伤 醉生 沉静 寂冷 白发".split(" ");
 
	var four_chars_words = "情深缘浅 情深不寿 莫失莫忘 阴阳相隔 如花美眷 似水流年 眉目如画 曲终人散 繁华落尽 不诉离殇 一世长安 半世烟尘 落梅似雪 冷月花魂 平湖秋月 蝶恋忆回 秋水伊人 断桥残雪 风动铃心 伊人已逝 望断秋水 似水流年 如花美眷 落晚芳菲 沧山映水 上善若水 匠心独运 倾国倾城 天香国色 浑然一体 如梦如幻 风华绝代 繁华落尽 寂寞如烟 独坐如莲 清风有情 明月可鉴 落花有情 流水可懂 流星有情 星空可睹 红颜有梦 陌上花开 弦断花落 似水流年 物是人非 昔云楚楚 紫燕悠悠 在水一方 雪殇若兮 燕笑语兮 清风扶柳 夕颜若雪 笑若扶风 凭兰秋思 素兮饶眉 雨夜聆风 月舞神殇 似水流年 此去经年 烟雨平生 宛如红袖 飞泉鸣玉 曾经沧海 谁堪共语 古道西风 流荆默望 往事如烟 静水流深 相濡以沫 笑靥如花 花开堪折 浮生若梦 情非得已 思绪万千 豆寇年华 地老天荒 曲终人散 沧海桑田 柒指流年 灯火阑珊 与子偕老 过眼云烟 生如夏花 尘埃落定 彼岸流年 莫矢莫忘".split(" ");
	var sentence_model = "xx，xx，xx了xx。 xxxx，xxxx，不过是一场xxxx。 你说xxxx，我说xxxx，最后不过xxxx。 xx，xx，许我一场xxxx。 一x一x一xx，半x半x半xx。 你说xxxxxxxx，后来xxxxxxxx。 xxxx，xxxx，终不敌xxxx。 xx，xxxx，xx，xxxx。 用我xxxx，换你xxxx。".split(" ");
	
	
```csharp
using System;
using System.Collections.Generic;
using System.Text.RegularExpressions;

public class DataLoader
{
    private static Dictionary<string, List<string>> data = new Dictionary<string, List<string>>
    {
        { "title", new List<string> { "标题1", "标题2", "标题3" } },
        { "noun", new List<string> { "名词1", "名词2", "名词3" } },
        { "verb", new List<string> { "动词1", "动词2", "动词3" } },
        { "adverb_1", new List<string> { "副词1", "副词2" } },
        { "adverb_2", new List<string> { "副词3", "副词4" } },
        { "phrase", new List<string> { "短语1", "短语2" } },
        { "sentence", new List<string> { "句子1", "句子2" } },
        { "parallel_sentence", new List<string> { "平行句子1", "平行句子2" } },
        { "beginning", new List<string> { "开头1", "开头2" } },
        { "body", new List<string> { "正文1", "正文2" } },
        { "ending", new List<string> { "结尾1", "结尾2" } }
    };

    private static Random random = new Random();

    private static int GetRandomNumber(int total)
    {
        return random.Next(total);
    }

    private static string GetRandom(List<string> list)
    {
        return list[GetRandomNumber(list.Count)];
    }

    public static string GetTitle() => GetRandom(data["title"]);

    public static string GetNoun() => GetRandom(data["noun"]);

    public static string GetVerb() => GetRandom(data["verb"]);

    public static string GetAdverb(int type)
    {
        return type switch
        {
            1 => GetRandom(data["adverb_1"]),
            2 => GetRandom(data["adverb_2"]),
            _ => string.Empty,
        };
    }

    public static string GetPhrase() => GetRandom(data["phrase"]);

    public static string GetSentence() => GetRandom(data["sentence"]);

    public static string GetParallelSentence() => GetRandom(data["parallel_sentence"]);

    public static string GetBeginning() => GetRandom(data["beginning"]);

    public static string GetBody() => GetRandom(data["body"]);

    public static string GetEnding() => GetRandom(data["ending"]);

    private static string ReplaceKey(string str, string key, string replacement)
    {
        return str.Replace(key, replacement);
    }

    private static string ReplaceKey(string str, Regex key, Func<string> replacement)
    {
        return key.Replace(str, _ => replacement());
    }

    public static string ReplaceXX(string str, string theme)
    {
        return ReplaceKey(str, "xx", theme);
    }

    public static string ReplaceVN(string str)
    {
        return ReplaceKey(str, new Regex("vn"), () =>
        {
            var vns = new List<string>();
            int count = GetRandomNumber(4) + 1;
            for (int i = 0; i < count; i++)
            {
                vns.Add(GetVerb() + GetNoun());
            }
            return string.Join("，", vns);
        });
    }

    public static string ReplaceV(string str)
    {
        return ReplaceKey(str, "v", GetVerb);
    }

    public static string ReplaceN(string str)
    {
        return ReplaceKey(str, "n", GetNoun);
    }

    public static string ReplaceSS(string str)
    {
        return ReplaceKey(str, "ss", GetSentence);
    }

    public static string ReplaceSP(string str)
    {
        return ReplaceKey(str, "sp", GetParallelSentence);
    }

    public static string ReplaceP(string str)
    {
        return ReplaceKey(str, "p", GetPhrase);
    }

    public static string ReplaceAll(string str, string theme)
    {
        str = ReplaceVN(str);
        str = ReplaceV(str);
        str = ReplaceN(str);
        str = ReplaceSS(str);
        str = ReplaceSP(str);
        str = ReplaceP(str);
        str = ReplaceXX(str, theme);
        return str;
    }

    public static string GenerateEssay(string theme = "年轻人买房", int essayNum = 500)
    {
        int beginNum = (int)(essayNum * 0.15);
        int bodyNum = (int)(essayNum * 0.7);
        int endNum = (int)(essayNum * 0.15);

        string title = ReplaceAll(GetTitle(), theme);
        string begin = "";
        string body = "";
        string end = "";

        while (begin.Length < beginNum)
        {
            begin += ReplaceAll(GetBeginning(), theme);
        }

        while (body.Length < bodyNum)
        {
            body += ReplaceAll(GetBody(), theme);
        }

        while (end.Length < endNum)
        {
            end += ReplaceAll(GetEnding(), theme);
        }

        return $"<h1>{title}</h1>\n<p>{begin}</p>\n<p>{body}</p>\n<p>{end}</p>";
    }
}
```
