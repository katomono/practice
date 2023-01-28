# %%
from collections import OrderedDict
import requests
import bs4
import re
import time
import json
from pathlib import Path

class YugiohCard:
    name = ""       # カード名称
    category = ""   # 魔法とか罠とか
    text = ""

    # モンスター固有
    attribute = ""  # 属性
    type = ""       # 種族
    level     = ""  # レベル
    attack = ""     # 攻撃力
    defence = ""    # 守備力

    # ペンデュラム固有
    ptext = ""

    def asdict(self):
        elems = OrderedDict()
        elems["名称"] = self.name
        elems["分類"] = self.category
        elems["属性"] = self.attribute
        elems["種族"] = self.type
        elems["レベル"] = self.level
        elems["攻撃力"] = self.attack
        elems["守備力"] = self.defence
        elems["テキスト"] = self.text

        return elems


class YugiohCardAPI:
    @classmethod
    def _single_card_url(cls, cid: int):
        return f"https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&cid={cid}&request_locale=ja"

    @classmethod
    def get(cls, cid):
        res = requests.get(cls._single_card_url(cid))
        soup = bs4.BeautifulSoup(res.text, "html.parser")
        card = YugiohCard()
        card.name = cls._name(soup)
        card.category = cls._category(soup)
        card.attribute = cls._attribute(soup)
        card.type = cls._type(soup)
        card.level = cls._level(soup)
        card.attack = cls._attack(soup)
        card.defence = cls._defence(soup)
        card.text = cls._text(soup)

        return card

    @classmethod
    def _name(cls, soup):
        text = ""
        try:
            text = soup.select("#cardname > h1")[0].text
            text = list(filter(lambda x: len(x) > 0, map(lambda x: x.replace("\t", ""), text.splitlines())))[1]
            return text
        except:
            pass
        return text

    @classmethod
    def _category(cls, soup):
        text = ""
        try:
            # モンスター用の処理
            text = soup.select("#CardTextSet > div:nth-child(1) > div:nth-child(3) > div > p")[0].text
            text = list(filter(lambda x: len(x) > 0, map(lambda x: x.replace("\t", ""), text.splitlines())))[2]
        except:
            try:
                # 魔法罠用の処理
                text = soup.select("#CardTextSet > div:nth-child(1) > div > div > span.item_box_value")[0].text
                text = list(filter(lambda x: len(x) > 0, map(lambda x: x.replace("\t", ""), text.splitlines())))[0]
            except:
                pass
        return text

    @classmethod
    def _type(cls, soup):
        text = ""
        try:
            text = soup.select("#CardTextSet > div:nth-child(1) > div:nth-child(3) > div > p")[0].text
            text = list(filter(lambda x: len(x) > 0, map(lambda x: x.replace("\t", ""), text.splitlines())))[0]
        except:
            pass
        return text


    @classmethod
    def _attribute(cls, soup):
        text = ""
        try:
            text = soup.select("#CardTextSet > div:nth-child(1) > div.frame.imgset > div:nth-child(1) > span.item_box_value")[0].text
            text = text.replace("\n", "").replace("\t", "")
        except:
            pass
        return text

    @classmethod
    def _level(cls, soup):
        text = ""
        try:
            text = soup.select("#CardTextSet > div:nth-child(1) > div.frame.imgset > div:nth-child(2) > span.item_box_value")[0].text
            text = int(list(filter(lambda x: len(x) > 0, re.findall("[0-9]*", text.replace("\n", "").replace("\t", ""))))[0])
        except:
            pass
        return text

    @classmethod
    def _defence(cls, soup):
        text = ""
        try:
            text = soup.select("#CardTextSet > div:nth-child(1) > div:nth-child(2) > div:nth-child(2) > span.item_box_value")[0].text
            text = text.replace("\n", "").replace("\t", "")
        except:
            pass
        return text

    @classmethod
    def _attack(cls, soup):
        text = ""
        try:      
            text = soup.select("#CardTextSet > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span.item_box_value")[0].text
            text = text.replace("\n", "").replace("\t", "")
        except:
            pass
        return text

    @classmethod
    def _text(cls, soup):
        text = ""
        try:
            text = "".join(ctx.text for ctx in soup.select("#CardTextSet > div:nth-child(2) > div")[0].contents[2:])
            text = text.replace("\n", "").replace("\t", "")
        except:
            pass
        return text


def main():
    is_first = True
    # tsvに邪魔な要素を含まないようにする
    as_string = lambda x: str(x).replace("\t", "").replace("\n", "")

    data_dir = Path("data")
    if not data_dir.exists():
        data_dir.mkdir()
    with (data_dir / "yugioh_card_db.tsv").open("w") as pw:
        for cid in range(0, 20000):
            card = YugiohCardAPI.get(cid)
            cfg = card.asdict()
            time.sleep(10)

            # カード情報が無い（IDにマッチするカードが存在しない）
            if all(x == "" for x in cfg.values()):
                print(f"skip! {cid}")
                continue

            if is_first:
                pw.write("\t".join(map(as_string, ["cid"] + list(cfg.keys()))) + "\n")
                is_first = False
            pw.write("\t".join(map(as_string, [cid], list(cfg.keys()))) + "\n")

if __name__ == "__main__":
    main()

