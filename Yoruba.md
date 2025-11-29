## https://www.yorubaness.com.ng/2022/06/yoruba-new-year-and-yoruba-calendar.html

# **1. YEAR STRUCTURE**

### **Yoruba Year (Odún):**

- Begins **June 3** (Gregorian calendar).
- Ends **June 2** of the following year.
- Example:

  - June 3, 2024 → June 2, 2025 = **Yoruba Year 10066** (approx, based on the 2014 = 10056 reference).

### **Historical numbering:**

- Gregorian 1958 = Yoruba 10000
- Gregorian 2014 = Yoruba 10056
  So **YorubaYear = GregorianYear + 10042** (approx, depending on whether date is before or after June 3).

---

# **2. WEEK SYSTEM**

There are TWO week systems:

## **A. Traditional 4-day Yoruba week**

Each day is tied to specific Orisa:

| Day number | Yoruba Day Purpose        | Orisa                           |
| ---------- | ------------------------- | ------------------------------- |
| Day 1      | Dedicated to **Obatala**  | (also Sopanna, Iyaami, Egungun) |
| Day 2      | Dedicated to **Orunmila** | (also Esu, Osun)                |
| Day 3      | Dedicated to **Ogun**     | (also Oshosi)                   |
| Day 4      | Dedicated to **Sango**    | (also Oya)                      |

Day 5 loops back to Day 1.

## **B. 7-day business week**

- Standard Monday → Sunday used for daily life & business.
- Each month = 4 business weeks.
- 52 weeks = 1 year.

---

# **3. MEASUREMENT OF TIME**

- **Iṣẹ́jú** → minute
- **Wákàtí** → hour
- **Òjò** → day
- **Òsè** → week (7 days)
- **Oṣù** → month (4 weeks)
- **Ọdún** → year (12 months)

---

# **4. FESTIVAL CALENDAR**

We can include these as events inside the website.

### 🌊 **Olokun Festival**

- Feb 21–25
- Orisa of deep sea & souls lost at sea.

### 🧔 Annual rites of passage for men

- March 12–28

### 🌍 Oduduwa Festival

- March 15–19
- Orisa of Earth, dark pigment, matron of existence.

### 🏹 Oshosi Festival

- March 21–24
- Orisa of hunting & adventure.

### ⚔️ Ogun Festival

- March 21–24
- Orisa of metal work, war craft, engineering, justice.

### 🌸 Oshun Festival

- Around last Saturday of April
- Fertility, pregnancy guidance.

### 🌀 Egungun Festival

- Starts last Saturday of May (7 days)
- Ancestors & community founders.

### 🎉 Yoruba New Year (Okudu 3)

- Always June 3
- Start of Yoruba year.

### 🦠 Shopona Festival

- June 7–8
- Orisa of disease & healing (with Osanyin).

### 👩 Women’s rites of passage

- June 10–23

### 🌊 Yemoja Festival

- June 18–21
- Matriarch of Orun-Rere, mother of many Orisa.

### 🔮 Ifa/Orunmila Festival

- First two weeks of July

### 🚜 Oko (Agriculture) — Yam Harvest

- Early July

### 🕊️ Elegba / Esu Festival

- Second weekend of July
- Orisa of communication & destiny paths.

### ⚡ Sango Festival

- Third week of July
- Orisa of thunder, lightning, energy.

### 🤍 Obatala Festival

- July (3rd or 4th week, depending on Agemo)

### ⚙️ Ogun Festival

- Last weekend of August

### 🌪️ Oya & Osun (Ijebu) Festival

- Third weekend of October

### 🍂 Shigidi Festival

- October 30
- Orisa of unsettled spirits.

### 💰 Obajulaiye Festival

- December (Ope 15)

---

# **5. SEASONS**

Based on weather cycles:

| Season                     | Yoruba Term | Approx Gregorian |
| -------------------------- | ----------- | ---------------- |
| Wet Season (Spring)        | Igbe        | April–May        |
| Dry Season (Autumn)        | Owọro       | Oct–Nov          |
| Second Dry Season (Winter) | Òpé         | Dec–Jan          |
| New Year Wet Onset         | Okudu       | June             |

---

# **6. WHAT WE NEED FOR THE WEBSITE**

Based on all this, our website needs:

### **A. Date Conversion Engine**

- Convert any Gregorian date → Yoruba date.
- Determine:

  - Yoruba year
  - Day in 4-day Orisa cycle
  - Day in 7-day business week
  - Yoruba month
  - Season
  - Festivals happening on that date

### **B. Yoruba Calendar View**

- Month view (Oṣu)
- Week view (4-day Orisa cycle OR 7-day week)
- Festival markers
- New Year highlight on June 3

### **C. API or logic functions**

- `getYorubaDate(gregorianDate)`
- `getOrisaDay(date)`
- `getYorubaYear(date)`
- `getYorubaMonth(date)`
- `getFestivals(date)`
- `getSeason(date)`

### **D. Data Models**

- Festival list with date rules
- Season ranges
- Conversion constants

### **ÌṢẸ̀ṢE CALENDAR FOR THE MONTH Of NOVEMBER, 2025**

```bash

01. Ọbàtálá/Òrìṣà-Ńlá, Yemòó, Èṣù, Egúngún, Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó, Orô, Ẹ̀lúkú, Agẹmọ, Òrìṣà Òkè, Ògìyán/Ògìrìyán.

02. Ifa/Ọ̀rúnmìlà, Ọ̀ṣun, Ọ̀sanyìn, Yemọja, Olókun, Ẹ̀là****

03. Ògún, Ìja, Ọ̀ṣọ́ọ̀sì, Òrìṣà-Oko, Erinlẹ̀.

04. Șàngó/Jàkúta, Ọya, Baáyànnì, Aganjú, Ọbalúayé/Ṣànpọ̀nná, Nàná-Bùkúù.

05. Ọbàtálá/Òrìṣà Ńlá, Yemòó,, Èṣù, Egúngún, Ẹgbẹ́-Ọ̀gbà/ Alárá-Igbó, Orò, Ẹ̀lúkú, Agẹmọ, Òrìṣà Òkè, Ògìyán/Ògìrìyán.

06. Ifa/Ọ̀rúnmìlà, Ọ̀ṣun, Ọ̀sanyìn, Yemọja, Olókun, Ẹ̀là**

07. Ògún, Ìja, Ọ̀ṣọ́ọ̀sì, Òrìṣà-Oko, Erinlẹ̀.

08. Ṣàngó/Jàkúta, Ọya, Baáyànnì, Aganjú, Ọbalúayé/Ṣànpọ̀nná, Nàná-Bùkúù.

09. Ọbàtálá/Òrìṣà Ńlá, Yemòó, Èṣù, Egúngún, Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó, Orò, Ẹ̀lúkú, Agẹmọ, Òrìṣà Òkè, Ògìyán/Ògìrìyán.

10. Ifá/Ọ̀rúnmìlà, Ọ̀ṣun, Ọ̀sanyìn, Yemọja, Olókun, Ẹ̀là***

11. Ògún, Ìja, Ọ̀ṣọ́ọ̀sì, Òrìṣà-Oko, Erinlẹ̀.

12. Ṣàngó/Jàkúta, Ọya, Baáyànnì, Aganjú, Ọbalúayé/Ṣànpọ̀nná, Nàná-Bùkúù.

13. Ọbàtálá/Òrìṣà Ńlá, Yemòó, Èṣù, Egúngún, Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó, Orò, Ẹ̀lúkú, Agẹmọ, Òrìṣà Òkè, Ògìyán/Ògìrìyán.

14. Ifá/Ọ̀rúnmìlà, Ọ̀ṣun, Ọ̀sanyìn, Yemọja, Olókun, Ẹ̀là.

15. Ògún, Ìja, Ọ̀ṣọ́ọ̀sì, Òrìṣà-Oko, Erinlẹ̀.

16. Ṣàngó/Jàkúta, Ọya, Baáyànnì, Aganjú, Ọbalúayé/Ṣànpọ̀nná, Nàná-Bùkúù.

17. Ọbàtálá/Òrìṣà Ńlá, Yemòó, Èṣù, Egúngún, Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó, Orò, Ẹ̀lúkú, Agẹmọ, Òrìṣà Òkè, Ògìyán/Ògìrìyán.

18. Ifá/Ọ̀rúnmìlà, Ọ̀ṣun, Ọ̀sanyìn, Yemọja, Olókun, Ẹ̀là****

19. Ògún, Ìja, Ọ̀ṣọ́ọ̀sí, Òrìṣà-Oko, Erinlẹ̀.

20. Ṣàngó/Jàkúta, Ọya, Baáyànnì, Aganjú, Ọbalúayé/Ṣànpọ̀nná, Nàná-Bùkúù.

21. Ọbàtálá/Òrìṣà Ńlá, Yemòó,Èṣù, Egúngún, Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó, Orò, Ẹ̀lúkú, Agẹmọ, Òrìṣà Òkè, Ògìyán/Ògìrìyán.

22. Ifá/Ọ̀rúnmìlà, Ọ̀ṣun, Ọ̀sanyìn, Yemọja, Olókun, Ẹ̀là**

23. Ògún, Ìja, Ọ̀ṣọ́ọ̀sì, Òrìṣà-Oko, Erinlẹ̀.

24. Ṣàngó/Jàkúta, Ọya, Baáyànnì, Aganjú, Ọbalúayé/Ṣànpọ̀nná, Nàná-Bùkúù.

25. Ọbàtálá/Òrìṣà Ńlá, Yemòó, Èṣù, Egúngún, Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó, Orò, Ẹ̀lúkú, Agẹmọ, Òrìṣà Òkè, Ògìyán/Ògìrìyán.

26. Ifá/Ọ̀rúnmìlà, Ọ̀ṣun, Ọ̀sanyìn, Yemọja, Olókun, Ẹ̀là***

27. Ògún, ìja, Ọ̀ṣọ́ọ̀sì, Òrìṣà-Oko, Erinlẹ̀.

28. Ṣàngó/Jàkúta, Ọya, Baáyànnì, Aganjú, Ọbalúayé/Ṣànpọ̀nná, Nàná-Bùkúù.

29. Ọbàtálá/Òrìṣà Ńlá, Yemòó, Èṣù, Egúngún, Ẹgbẹ́-Ọ̀gbà/Alárá-Igbó, Orò, Ẹ̀lúkú, Agẹmọ, Òrìṣà Òkè, Ògìyán/Ògìrìyán.

30. Ifá/Ọ̀rúnmìlà, Ọ̀ṣun, Ọ̀sanyìn, Yemọja, Olókun, Ẹ̀là.

 *Note:*
**** Ìtàdógún - Ọ̀ṣẹ̀ Awo.
*** Isán - Ọ̀ṣẹ̀ Awo.
** Ọrún - Ọ̀ṣẹ̀ Awo.

Before Gregorian calendar, we used four days a week with which each day is dedicated to a group of Orisa. For instance
Day 1. Obatala day
Day 2. Ifa day
Day 3. Ogun day
Day 4: sango day

However, it is counted as five (Orun) because Yoruba says we don’t count days as we count money. The difference is that when we count want to count days, you can’t the present day as part of it. As today is obatala day, the next obatala day is in the next five days because you count today with it, numerically, it’s four days.
Also, note that Obatala owns days, but it was Orunmila that grouped the orisas into days.
We also have ten months instead of 12 we have today. This is because we follow the moon hence our month is not up to 30days. We mark a new month when the crescent moon comes up and the month ends when there is a full moon.
Ire ooo
```
