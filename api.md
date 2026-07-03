# Ozon Seller API — методы для аналитики продавца

Источник: загруженный `swagger.json`, OpenAPI 3.0, `Документация Ozon Seller API`, version `2.1`. Использован только этот swagger.

## Краткое резюме

- Для MVP чистой прибыли главный источник факта денег — `POST /v3/finance/transaction/list`; для KPI-сверки — `POST /v3/finance/transaction/totals`.
- Для продаж и количества товаров нужны отправления: актуальные `POST /v3/posting/fbo/list` и `POST /v4/posting/fbs/list`; старые `POST /v2/posting/fbo/list` и `POST /v3/posting/fbs/list` помечены как `Deprecated`.
- Для справочника SKU нужны `POST /v3/product/list` + `POST /v3/product/info/list`.
- Себестоимость, доставка из Китая, упаковка, зарплаты, налоговые настройки, накладные расходы и ручные корректировки в этом Seller API не найдены — хранить внутри приложения.
- Performance-реклама в этом swagger не найдена. Для рекламных кабинетов нужен отдельный swagger/documentation Ozon Performance API. Акции Ozon/Seller Actions в Seller API есть, но это не полноценная Performance API.
- Seller API нельзя вызывать напрямую из браузера: ключи `Client-Id` и `Api-Key` должны храниться только на backend/proxy приложения.

## Список API-запросов

| № | Method | Endpoint | Блок | Назначение | Статус |
| --- | --- | --- | --- | --- | --- |
| 1 | POST | /v1/roles | Авторизация и проверка доступа | Проверить API-ключ, список доступных ролей/методов и дату истечения ключа. | Актуальный |
| 2 | POST | /v1/seller/info | Информация о продавце | Получить данные кабинета продавца: компания, валюта, налоговая система, рейтинги, подписка. | Актуальный |
| 3 | POST | /v3/product/list | Товары | Получить список товаров и базовую связку offer_id ↔ product_id. | Актуальный |
| 4 | POST | /v3/product/info/list | Товары | Получить подробную информацию по товарам: SKU, название, изображения, цены, комиссии, статусы, остатки. | Актуальный |
| 5 | POST | /v4/product/info/attributes | Товары | Получить описание характеристик товара. | Актуальный |
| 6 | POST | /v2/product/pictures/info | Товары | Получить изображения товаров. | Актуальный |
| 7 | POST | /v5/product/info/prices | Цены и комиссии | Получить информацию о цене товара, скидках и комиссиях. | Актуальный |
| 8 | POST | /v4/product/info/stocks | Остатки | Получить остатки FBO/FBS/rFBS/FBP по товарам. | Актуальный |
| 9 | POST | /v2/product/info/stocks-by-warehouse/fbs | Остатки | Получить остатки FBS/rFBS по складам продавца. | Актуальный |
| 10 | POST | /v2/warehouse/list | Остатки | Получить список складов продавца. | Актуальный |
| 11 | POST | /v3/posting/fbo/list | Продажи / заказы / отправления | Получить список FBO-отправлений за период. | Актуальный |
| 12 | POST | /v2/posting/fbo/list | Продажи / заказы / отправления | Старый метод списка FBO-отправлений. | Deprecated |
| 13 | POST | /v2/posting/fbo/get | Продажи / заказы / отправления | Получить детализацию конкретного FBO-отправления. | Актуальный |
| 14 | POST | /v4/posting/fbs/list | Продажи / заказы / отправления | Получить список FBS/rFBS-отправлений за период. | Актуальный |
| 15 | POST | /v3/posting/fbs/list | Продажи / заказы / отправления | Старый метод списка FBS-отправлений. | Deprecated |
| 16 | POST | /v3/posting/fbs/get | Продажи / заказы / отправления | Получить детализацию конкретного FBS/rFBS-отправления. | Актуальный |
| 17 | POST | /v3/finance/transaction/list | Финансы / начисления / поступления | Получить список финансовых транзакций. | Актуальный |
| 18 | POST | /v3/finance/transaction/totals | Финансы / начисления / поступления | Получить агрегированные суммы транзакций. | Актуальный |
| 19 | POST | /v2/finance/realization | Финансы / начисления / поступления | Получить отчёт о реализации товаров за месяц. | Актуальный |
| 20 | POST | /v1/finance/realization/posting | Финансы / начисления / поступления | Получить позаказный отчёт о реализации товаров. | Актуальный |
| 21 | POST | /v1/finance/cash-flow-statement/list | Финансы / начисления / поступления | Получить финансовый отчёт по денежному потоку. | Актуальный |
| 22 | POST | /v1/finance/mutual-settlement | Финансы / начисления / поступления | Сформировать отчёт о взаиморасчётах. | Актуальный |
| 23 | POST | /v1/finance/products/buyout | Финансы / начисления / поступления | Получить отчёт о выкупленных товарах. | Актуальный |
| 24 | POST | /v1/returns/list | Возвраты | Получить информацию о возвратах FBO и FBS. | Актуальный |
| 25 | POST | /v2/returns/rfbs/list | Возвраты | Получить список заявок на возврат rFBS. | Актуальный |
| 26 | POST | /v1/returns/company/fbs/info | Возвраты | Получить количество возвратов FBS по drop-off пунктам. | Актуальный |
| 27 | POST | /v1/report/products/create | Отчёты | Создать отчёт по товарам. | Актуальный |
| 28 | POST | /v1/report/postings/create | Отчёты | Создать отчёт об отправлениях. | Актуальный |
| 29 | POST | /v2/report/returns/create | Отчёты | Создать отчёт о возвратах. | Актуальный |
| 30 | POST | /v1/report/warehouse/stock | Отчёты | Создать отчёт об остатках на FBS-складе. | Актуальный |
| 31 | POST | /v1/report/placement/by-products/create | Отчёты | Создать отчёт о стоимости размещения по товарам. | Актуальный |
| 32 | POST | /v1/report/placement/by-supplies/create | Отчёты | Создать отчёт о стоимости размещения по поставкам. | Актуальный |
| 33 | POST | /v1/report/info | Отчёты | Получить статус и ссылку на файл отчёта. | Актуальный |
| 34 | POST | /v1/report/list | Отчёты | Получить список ранее созданных отчётов. | Актуальный |
| 35 | POST | /v2/analytics/stock_on_warehouses | Аналитика | Получить отчёт по остаткам и товарам на складах. | Актуальный |
| 36 | POST | /v1/analytics/turnover/stocks | Аналитика | Получить оборачиваемость товара. | Актуальный |
| 37 | POST | /v1/analytics/stocks | Аналитика | Получить аналитику по остаткам. | Актуальный |
| 38 | GET | /v1/actions | Продвижение / акции Seller API | Получить список доступных акций Ozon. | Актуальный |
| 39 | POST | /v1/actions/products | Продвижение / акции Seller API | Получить товары, участвующие в акции Ozon. | Актуальный |
| 40 | POST | /v1/seller-actions/list | Продвижение / акции Seller API | Получить список акций продавца. | Актуальный |
| 41 | POST | /v1/seller-actions/products/list | Продвижение / акции Seller API | Получить товары, участвующие в акции продавца. | Актуальный |

## Общие правила auth / backend

Swagger содержит глобальное описание формата запроса Seller API и параметры headers у большинства операций. На frontend нельзя хранить `Api-Key` и `Client-Id`; запросы идут через backend/proxy.

| Header | Обязательный | Описание | Пример |
| --- | --- | --- | --- |
| Client-Id | Да | Идентификатор клиента | `<Client-Id>` |
| Api-Key | Да | API-ключ продавца | `<Api-Key>` |
| Content-Type | Да для JSON body | Тип тела запроса | `application/json` |

OAuth описан в swagger глобально как `Authorization: Bearer ACCESS_TOKEN`, но `securitySchemes` в OpenAPI-структуре не заданы; поэтому в каждом методе ниже auth трактуется по headers из `parameters`, а если их нет — помечено `Нужно уточнить`.

---

## 1. POST /v1/roles

**Статус:** Актуальный.

### Блок аналитики
Авторизация и проверка доступа

### Назначение
Проверить API-ключ, список доступных ролей/методов и дату истечения ключа.

### Что закрывает в аналитике
доступы, expires_at, roles, methods

### Когда вызывается
при подключении магазина, health-check интеграции, проверка перед синхронизацией

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Нет

```json
{}
```

### Response
Response schema: `v1RolesByTokenResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| expires_at | string | Дата истечения срока действия ключа. |
| roles | array<RolesByTokenResponseRoles> | Информация о доступных ролях и методах. |
| roles[].name | string | Название роли. |
| roles[].methods | array<string> | Методы, доступные для роли. |

---

## 2. POST /v1/seller/info

**Статус:** Актуальный.

### Блок аналитики
Информация о продавце

### Назначение
Получить данные кабинета продавца: компания, валюта, налоговая система, рейтинги, подписка.

### Что закрывает в аналитике
seller profile, currency, tax_system, ratings

### Когда вызывается
при первичной синхронизации магазина и обновлении настроек аккаунта

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Нет

```json
{}
```

### Response
Response schema: `v1SellerInfoResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| company | SellerInfoResponseCompany | Компания. |
| company.country | string | Страна. |
| company.currency | string | Валюта: - `RUB` — российский рубль; - `EUR` — евро; - `USD` — доллар США; - `CNY` — юань; - `BYN` — белорусский рубль; - `KZT` — тенге; - `KGS` — киргизский сом |
| company.inn | string | ИНН. |
| company.legal_name | string | Название юридического лица. |
| company.name | string | Название компании на Ozon. |
| company.ogrn | string | ОГРН. |
| company.ownership_form | string | Форма собственности. |
| company.tax_system | CompanyTaxSystemEnum | Система налогообложения: - `UNKNOWN` — неизвестная, - `UNSPECIFIED` — не определена, - `OSNO` — ОСНО, - `USN` — УСН, - `NPD` — НПД, - `AUSN` — АУСН, - `PSN` — П |
| ratings | array<SellerInfoResponseRating> | Список рейтингов. |
| ratings[].current_value | RatingValueCurrent | Значение рейтинга. |
| ratings[].name | string | Название рейтинга. |

---

## 3. POST /v3/product/list

**Статус:** Актуальный.

### Блок аналитики
Товары

### Назначение
Получить список товаров и базовую связку offer_id ↔ product_id.

### Что закрывает в аналитике
offer_id, product_id, visibility, paging cursor

### Когда вызывается
при первичной синхронизации каталога и периодическом обновлении справочника товаров

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `productv3GetProductListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| filter | productv3GetProductListRequestFilter | Нет | Фильтр по товарам. | Не указано |
| last_id | string | Нет | Идентификатор последнего значения на странице. При первом запросе оставьте это поле пустым.  Чтобы получить следующие значения, укажите `last_id` из ответа предыдущего запроса. | Не указано |
| limit | integer | Нет | Количество значений на странице. Минимум — 1, максимум — 1000. | Не указано |

Вложенная схема `productv3GetProductListRequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| offer_id | object | Нет | Фильтр по параметру `offer_id`. Вы можете передавать список значений. | Не указано |
| product_id | object | Нет | Фильтр по параметру `product_id`. Вы можете передавать список значений. | Не указано |
| visibility | productv3GetProductListRequestFilterFilterVisibility | Нет | Фильтр по видимости товара:   - `ALL` — все товары, кроме архивных;   - `VISIBLE` — товары, которые видны покупателям;   - `INVISIBLE` — товары, которые не видны покупателям;   - `EMPTY_STOCK` — товары, у которых не указано наличие;   - `NOT_MODERAT… | ALL |

```json
{
  "filter": {
    "visibility": "ALL"
  },
  "last_id": "",
  "limit": 1000
}
```

### Response
Response schema: `productv3GetProductListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | productv3GetProductListResponseResult | Результат. |
| result.items | object | Список товаров. |
| result.last_id | string | Идентификатор последнего значения на странице.  Чтобы получить следующие значения, передайте полученное значение в следующем запросе в параметре `last_id`. |
| result.total | integer | Всего товаров. |

---

## 4. POST /v3/product/info/list

**Статус:** Актуальный.

### Блок аналитики
Товары

### Назначение
Получить подробную информацию по товарам: SKU, название, изображения, цены, комиссии, статусы, остатки.

### Что закрывает в аналитике
SKU, offer_id, product_id, name, images, price, min_price, commissions, stocks, statuses

### Когда вызывается
после /v3/product/list, при открытии карточки товара, при обновлении каталога

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v3GetProductInfoListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| offer_id | array<string> | Нет | Идентификатор товара в системе продавца — артикул. | Не указано |
| product_id | array<string> | Нет | Идентификатор товара в системе Ozon — `product_id`. | Не указано |
| sku | array<string> | Нет | Идентификатор товара в системе Ozon — SKU. | Не указано |

```json
{
  "offer_id": [
    "seller-offer-1"
  ]
}
```

### Response
Response schema: `v3GetProductInfoListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| items | array<v3GetProductInfoListResponseItem> | Массив данных. |
| items[].availabilities | array<GetProductInfoListResponseAvailability> | Информация о доступности товара. |
| items[].barcodes | array<string> | Все штрихкоды товара. |
| items[].color_image | array<string> | Изображение цвета товара. |
| items[].commissions | array<GetProductInfoListResponseCommission> | Информация о комиссиях. |
| items[].created_at | string | Дата и время создания товара. |
| items[].currency_code | string | Валюта. |
| items[].description_category_id | integer | Идентификатор категории. Используйте его с методами [/v1/description-category/attribute](#operation/DescriptionCategoryAPI_GetAttributes) и [/v1/description-cat |
| items[].discounted_fbo_stocks | integer | Остатки уценённого товара на складе Ozon. |
| items[].errors | array<GetProductInfoListResponseError> | Информация об ошибках при создании или валидации товара. |
| items[].has_discounted_fbo_item | boolean | Признак, что у товара есть уценённые аналоги на складе Ozon. |
| items[].id | integer | Идентификатор товара в системе Ozon — `product_id`. |

---

## 5. POST /v4/product/info/attributes

**Статус:** Актуальный.

### Блок аналитики
Товары

### Назначение
Получить описание характеристик товара.

### Что закрывает в аналитике
product_id, offer_id, sku, attributes; для прибыли напрямую не считает

### Когда вызывается
при открытии карточки товара или если нужны фильтры/характеристики в каталоге

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `productv4GetProductAttributesV4Request`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| filter | productv4Filter | Нет | Фильтр по товарам. | Не указано |
| last_id | string | Нет | Идентификатор последнего значения на странице. Оставьте это поле пустым при выполнении первого запроса.  Чтобы получить следующие значения, укажите `last_id` из ответа предыдущего запроса. | Не указано |
| limit | integer | Нет | Количество значений на странице. | Не указано |
| sort_by | string | Нет | Параметр, по которому товары будут отсортированы: - `sku` — сортировка по идентификатору товара в системе Ozon; - `offer_id` — сортировка по артикулу товара; - `id` — сортировка по идентификатору товара; - `title` — сортировка по названию товара. | Не указано |
| sort_dir | string | Нет | Направление сортировки: - `asc` — по возрастанию, - `desc` — по убыванию. | Не указано |

Вложенная схема `productv4Filter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| offer_id | object | Нет | Фильтр по параметру `offer_id`. Можно передавать список значений. | Не указано |
| product_id | object | Нет | Фильтр по параметру `product_id`. Можно передавать до 1000 значений. | Не указано |
| sku | array<string> | Нет | Идентификатор товара в системе Ozon — SKU. | Не указано |
| visibility | productv2GetProductListRequestFilterFilterVisibility | Нет | Фильтр по видимости товара:   - `ALL` — все товары, кроме архивных;   - `VISIBLE` — товары, которые видны покупателям;   - `INVISIBLE` — товары, которые не видны покупателям;   - `EMPTY_STOCK` — товары, у которых не указано наличие;   - `NOT_MODERAT… | ALL |

```json
{
  "filter": {
    "offer_id": [
      "seller-offer-1"
    ],
    "visibility": "ALL"
  },
  "last_id": "",
  "limit": 100
}
```

### Response
Response schema: `productv4GetProductAttributesV4Response`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | array<productv4GetProductAttributesV4ResponseResult> | Результаты запроса. |
| result[].attributes | array<productGetProductAttributesV4ResponseAttribute> | Список характеристик товара. |
| result[].attributes_with_defaults | array<integer> | Список идентификаторов характеристик со значением по умолчанию. |
| result[].barcode | string | Штрихкод. |
| result[].barcodes | array of strings | Все штрихкоды товара. |
| result[].description_category_id | integer | Идентификатор категории. Используйте его с методами [/v1/description-category/attribute](#operation/DescriptionCategoryAPI_GetAttributes) и [/v1/description-cat |
| result[].color_image | string | Маркетинговый цвет. |
| result[].complex_attributes | array<GetProductAttributesV4ResponseAttribute> | Массив вложенных характеристик. |
| result[].depth | integer | Глубина. |
| result[].dimension_unit | string | Единица измерения габаритов:   - `mm` — миллиметры,   - `cm` — сантиметры,   - `in` — дюймы. |
| result[].height | integer | Высота упаковки. |
| result[].id | integer | Идентификатор товара в системе Ozon — `product_id`. |

---

## 6. POST /v2/product/pictures/info

**Статус:** Актуальный.

### Блок аналитики
Товары

### Назначение
Получить изображения товаров.

### Что закрывает в аналитике
product_id, images/pictures; для UI карточек и таблицы товаров

### Когда вызывается
при синхронизации витрины товаров или карточки товара

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v2ProductInfoPicturesRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| product_id | object | Да | Список идентификаторов товаров в системе Ozon — `product_id`. | Не указано |

```json
{
  "product_id": [
    123456789
  ]
}
```

### Response
Response schema: `v2ProductInfoPicturesResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| items | array<v2ProductInfoPicturesResponseItem> | Изображения товаров. |
| items[].product_id | integer | Идентификатор товара в системе Ozon — `product_id`. |
| items[].primary_photo | array<string> | Ссылка на главное изображение. |
| items[].photo | array<string> | Ссылки на фотографии товара. |
| items[].color_photo | array<string> | Ссылки на загруженные образцы цвета. |
| items[].photo_360 | array<string> | Ссылки на изображения 360. |
| items[].errors | array<v2ProductInfoPicturesResponseError> | Список ошибок по изображениям товара. |

---

## 7. POST /v5/product/info/prices

**Статус:** Актуальный.

### Блок аналитики
Цены и комиссии

### Назначение
Получить информацию о цене товара, скидках и комиссиях.

### Что закрывает в аналитике
price, old_price, min_price, marketing_price, commissions, offer_id, product_id

### Когда вызывается
при обновлении цен, расчёте потенциальной маржи и проверке цены товара

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `productv5GetProductInfoPricesV5Request`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| cursor | string | Нет | Указатель для выборки следующих данных. | Не указано |
| filter | productv5Filter | Да | Фильтр по товарам. | Не указано |
| limit | integer | Да | Количество значений на странице. | Не указано |

Вложенная схема `productv5Filter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| offer_id | object | Нет | Фильтр по параметру `offer_id`. Можно передавать до 1000 значений. | Не указано |
| product_id | object | Нет | Фильтр по параметру `product_id`. Можно передавать до 1000 значений. | Не указано |
| visibility | productv5GetProductListRequestFilterFilterVisibility | Нет | Фильтр по видимости товара:   - `ALL` — все товары, кроме архивных;   - `VISIBLE` — товары, которые видны покупателям;   - `INVISIBLE` — товары, которые не видны покупателям;   - `EMPTY_STOCK` — товары, у которых не указано наличие;   - `NOT_MODERAT… | ALL |

```json
{
  "filter": {
    "offer_id": [
      "seller-offer-1"
    ],
    "visibility": "ALL"
  },
  "limit": 1000,
  "cursor": ""
}
```

### Response
Response schema: `productv5GetProductInfoPricesV5Response`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| cursor | string | Указатель для выборки следующих данных. |
| items | object | Список товаров. |
| total | integer | Количество товаров в списке. |

---

## 8. POST /v4/product/info/stocks

**Статус:** Актуальный.

### Блок аналитики
Остатки

### Назначение
Получить остатки FBO/FBS/rFBS/FBP по товарам.

### Что закрывает в аналитике
stocks, present/reserved, offer_id, product_id, warehouse data Нужно уточнить по response schema

### Когда вызывается
при обновлении остатков, расчёте остатков в деньгах, low/no stock статусов

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v4GetProductInfoStocksRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| cursor | string | Нет | Указатель для выборки следующих данных. | Не указано |
| filter | v4GetProductInfoStocksRequestFilter | Да | Фильтр по товарам. | Не указано |
| limit | integer | Да | Количество значений на странице. Минимум — 1, максимум — 1000. | Не указано |

Вложенная схема `v4GetProductInfoStocksRequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| offer_id | array<string> | Нет | Фильтр по параметру `offer_id`. Можно передавать список значений. | Не указано |
| product_id | array<string> | Нет | Фильтр по параметру `product_id`. Можно передавать список значений. | Не указано |
| visibility | v4Visibility | Нет | Фильтр по видимости товара:   - `ALL` — все товары, кроме архивных;   - `VISIBLE` — товары, которые видны покупателям;   - `INVISIBLE` — товары, которые не видны покупателям;   - `EMPTY_STOCK` — товары, у которых не указано наличие;   - `NOT_MODERAT… | ALL |
| with_quant | FilterWithQuant | Нет | Товары по тарифу «Эконом». | Не указано |

```json
{
  "filter": {
    "offer_id": [
      "seller-offer-1"
    ],
    "visibility": "ALL"
  },
  "limit": 1000,
  "cursor": ""
}
```

### Response
Response schema: `v4GetProductInfoStocksResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| cursor | string | Указатель для выборки следующих данных. |
| items | array<v4GetProductInfoStocksResponseItem> | Информация о товарах. |
| items[].offer_id | string | Идентификатор товара в системе продавца — артикул. |
| items[].product_id | integer | Идентификатор товара в системе Ozon — `product_id`. |
| items[].stocks | array<GetProductInfoStocksResponseStock> | Информация об остатках. |
| total | integer | Количество уникальных товаров, для которых выводится информация об остатках. |

---

## 9. POST /v2/product/info/stocks-by-warehouse/fbs

**Статус:** Актуальный.

### Блок аналитики
Остатки

### Назначение
Получить остатки FBS/rFBS по складам продавца.

### Что закрывает в аналитике
offer_id, sku, warehouse_id, stock; FBS/rFBS остатки

### Когда вызывается
при детализации остатков по складам продавца

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v2GetProductInfoStocksByWarehouseFbsRequestV2`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| cursor | string | Нет | Указатель для выборки следующих данных. | Не указано |
| limit | integer | Да | Количество значений в ответе. | Не указано |
| offer_id | array<string> | Нет | Идентификаторы товаров в системе продавца — артикул. | Не указано |
| sku | array<string> | Нет | Идентификаторы товаров в системе Ozon — SKU. | Не указано |

```json
{
  "offer_id": [
    "seller-offer-1"
  ],
  "limit": 1000,
  "cursor": ""
}
```

### Response
Response schema: `v2GetProductInfoStocksByWarehouseFbsResponseV2`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| cursor | string | Указатель для выборки следующих данных. |
| has_next | boolean | `true`, если в ответе вернули не все товары. |
| products | array<v2GetProductInfoStocksByWarehouseFbsResponseV2Product> | Остатки товаров. |
| products[].free_stock | integer | Количество доступных для продажи товаров. |
| products[].offer_id | string | Идентификатор товара в системе продавца — артикул. |
| products[].present | integer | Общее количество товара на складе. |
| products[].product_id | integer | Идентификатор товара в системе продавца — артикул. |
| products[].reserved | integer | Количество зарезервированных товаров на складе. |
| products[].sku | integer | Идентификатор товара в системе Ozon — SKU. |
| products[].warehouse_id | integer | Идентификатор склада. |
| products[].warehouse_name | string | Название склада. |

---

## 10. POST /v2/warehouse/list

**Статус:** Актуальный.

### Блок аналитики
Остатки

### Назначение
Получить список складов продавца.

### Что закрывает в аналитике
warehouse_id, warehouse_name, warehouse_type, status

### Когда вызывается
при первичной синхронизации складов и расшифровке остатков/отправлений

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v2WarehouseListV2Request`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| limit | integer | Да | Количество значений в ответе. | Не указано |
| cursor | string | Нет | Указатель для выборки следующих данных. | Не указано |
| warehouse_ids | array<string> | Нет | Идентификаторы складов. | Не указано |

```json
{
  "limit": 1000,
  "cursor": ""
}
```

### Response
Response schema: `v2WarehouseListV2Response`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| cursor | string | Указатель для выборки следующих данных. |
| warehouses | array<WarehouseListV2ResponseWarehouse> | Список складов. |
| warehouses[].address_info | WarehouseAddressInfo | Информация о расположении склада. |
| warehouses[].carriage_label_type | WarehouseCarriageLabelTypeEnum | Тип этикетки: - `UNSPECIFIED` — неизвестный тип; - `BIG` — большая этикетка; - `SMALL` — маленькая этикетка. |
| warehouses[].courier_comment | string | Комментарий для курьера. |
| warehouses[].courier_phones | array<string> | Номера телефонов для связи с курьером. |
| warehouses[].created_at | string | Дата и время создания склада. |
| warehouses[].cut_in_time | integer | Время на отгрузку в минутах. |
| warehouses[].first_mile | WarehouseFirstMile | Первая миля. |
| warehouses[].has_entrusted_acceptance | boolean | Признак подключения доверительной приемки. |
| warehouses[].has_postings_limit | boolean | Признак наличия лимита минимального количества заказов. `true`, если лимит есть. |
| warehouses[].is_auto_assembly | boolean | Признак включённой автосборки. |

---

## 11. POST /v3/posting/fbo/list

**Статус:** Актуальный.

### Блок аналитики
Продажи / заказы / отправления

### Назначение
Получить список FBO-отправлений за период.

### Что закрывает в аналитике
posting_number, order_id, order_number, products, financial_data, analytics_data, status

### Когда вызывается
при обновлении продаж/заказов за период и сверке с finance

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `posting.v3.PostingFboListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| cursor | string | Нет | Указатель для выборки следующих данных. | Не указано |
| filter | posting.v3.PostingFboListRequest.Filter | Нет | Фильтр для поиска отправлений. | Не указано |
| limit | integer | Нет | Количество значений в ответе. | Не указано |
| sort_dir | posting.v3.PostingFboListRequest.SortDir.Enum | Нет | Направление сортировки: - `ASC` — по возрастанию; - `DESC` — по убыванию. | Не указано |
| translit | boolean | Нет | `true`, чтобы включить транслитерацию адреса из кириллицы в латиницу. | Не указано |
| with | posting.v3.PostingFboListRequest.With | Нет | Дополнительные поля, которые нужно добавить в ответ. | Не указано |

Вложенная схема `posting.v3.PostingFboListRequest.Filter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| order_numbers | array<string> | Нет | Номера заказов, к которым относятся отправления. | Не указано |
| posting_numbers | array<string> | Нет | Идентификаторы отправлений. | Не указано |
| since | string | Нет | Начало периода. | Не указано |
| statuses | array<string> | Нет | Статус отправления:   - `awaiting_packaging` — ожидает упаковки;   - `awaiting_deliver` — ожидает отгрузки;   - `delivering` — доставляется;   - `delivered` — доставлено;   - `cancelled` — отменено. | Не указано |
| to | string | Нет | Конец периода. | Не указано |

Вложенная схема `posting.v3.PostingFboListRequest.With`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| analytics_data | boolean | Нет | `true`, чтобы добавить в ответ данные аналитики. | Не указано |
| financial_data | boolean | Нет | `true`, чтобы добавить в ответ финансовые данные. | Не указано |
| legal_info | boolean | Нет | `true`, чтобы добавить в ответ юридическую информацию. | Не указано |

```json
{
  "filter": {
    "since": "2026-07-01T00:00:00Z",
    "to": "2026-07-02T00:00:00Z"
  },
  "limit": 1000,
  "cursor": "",
  "with": {
    "analytics_data": true,
    "financial_data": true
  }
}
```

### Response
Response schema: `posting.v3.PostingFboListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| cursor | string | Указатель для выборки следующих данных. |
| has_next | boolean | `true`, если в ответе вернулись не все отправления. |
| postings | array<posting.v3.PostingFboListResponse.Postings> | Список отправлений. |
| postings[].additional_data | array<posting.v3.PostingFboListResponse.Postings.AdditionalData> | Дополнительные параметры. |
| postings[].analytics_data | posting.v3.PostingFboListResponse.Postings.AnalyticsData | Данные аналитики. |
| postings[].cancel_reason_id | integer | Идентификатор причины отмены отправления. |
| postings[].cancellation | posting.v3.PostingFboListResponse.Postings.Cancellation | Информация об отмене. |
| postings[].created_at | string | Дата и время создания отправления. |
| postings[].external_order | posting.v3.PostingFboListResponse.Postings.ExternalOrder | Информация о заказе с внешней платформы. |
| postings[].financial_data | posting.v3.PostingFboListResponse.Postings.FinancialData | Финансовые данные. |
| postings[].in_process_at | string | Дата и время начала обработки отправления. |
| postings[].legal_info | posting.v3.PostingFboListResponse.Postings.LegalInfo | Юридическая информация о покупателе. |

---

## 12. POST /v2/posting/fbo/list

**Статус:** Deprecated. Актуальный аналог использовать только если он есть в swagger.
**Актуальный аналог в swagger:** `POST /v3/posting/fbo/list`.

### Блок аналитики
Продажи / заказы / отправления

### Назначение
Старый метод списка FBO-отправлений.

### Что закрывает в аналитике
posting_number, products, financial_data; метод устаревший

### Когда вызывается
не использовать в новой реализации, только legacy fallback

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `postingGetFboPostingListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| dir | string | Нет | Направление сортировки:   - `ASC` — по возрастанию,   - `DESC` — по убыванию. | Не указано |
| filter | postingGetFboPostingListRequestFilter | Да | Фильтр для поиска отправлений. | Не указано |
| limit | integer | Да | Количество значений в ответе:   - максимум — 1000,   - минимум — 1. | Не указано |
| offset | integer | Нет | Количество элементов, которое будет пропущено в ответе. Например, если `offset = 10`, то ответ начнётся с 11-го найденного элемента. Максимальное значение — 20000. | Не указано |
| translit | boolean | Нет | Если включена транслитерация адреса из кириллицы в латиницу — `true`. | Не указано |
| with | postingFboPostingWithParams | Нет | Дополнительные поля, которые нужно добавить в ответ. | Не указано |

Вложенная схема `postingGetFboPostingListRequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| since | string | Да | Начало периода. | Не указано |
| status | string | Нет | Статус отправления. - `awaiting_packaging` — ожидает упаковки, - `awaiting_deliver` — ожидает отгрузки, - `delivering` — доставляется, - `delivered` — доставлено, - `cancelled` — отменено. | Не указано |
| to | string | Да | Конец периода. | Не указано |

Вложенная схема `postingFboPostingWithParams`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| analytics_data | boolean | Нет | Передайте `true`, чтобы добавить в ответ данные аналитики. | Не указано |
| financial_data | boolean | Нет | Передайте `true`, чтобы добавить в ответ финансовые данные. | Не указано |
| legal_info | boolean | Нет | Передайте `true`, чтобы добавить в ответ юридическую информацию. | Не указано |

```json
{
  "filter": {
    "since": "2026-07-01T00:00:00Z",
    "to": "2026-07-02T00:00:00Z"
  },
  "limit": 1000,
  "offset": 0,
  "with": {
    "analytics_data": true,
    "financial_data": true
  }
}
```

### Response
Response schema: `v2FboPostingListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | array<v2FboPostingV2> | Массив отправлений. |
| result[].additional_data | array<v2AdditionalDataItem> | Не указано |
| result[].analytics_data | FboPostingFboPostingAnalyticsData | Данные аналитики. |
| result[].cancel_reason_id | integer | Идентификатор причины отмены отправления. |
| result[].created_at | string | Дата и время создания отправления. |
| result[].financial_data | v2PostingFinancialDataFBOV2 | Финансовые данные. |
| result[].in_process_at | string | Дата и время начала обработки отправления. |
| result[].legal_info | v2FboSinglePostingLegalInfo | Юридическая информация о покупателе. |
| result[].order_id | integer | Идентификатор заказа, к которому относится отправление. |
| result[].order_number | string | Номер заказа, к которому относится отправление. |
| result[].posting_number | string | Номер отправления. |
| result[].products | array<v2PostingProduct> | Список товаров в отправлении. |

---

## 13. POST /v2/posting/fbo/get

**Статус:** Актуальный.

### Блок аналитики
Продажи / заказы / отправления

### Назначение
Получить детализацию конкретного FBO-отправления.

### Что закрывает в аналитике
posting_number, products, financial_data, analytics_data, status

### Когда вызывается
при открытии конкретного заказа/отправления или отладке расхождений

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `postingGetFboPostingRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| posting_number | string | Да | Номер отправления. | Не указано |
| translit | boolean | Нет | Если включена транслитерация адреса из кириллицы в латиницу — `true`. | Не указано |
| with | postingFboPostingWithParams | Нет | Дополнительные поля, которые нужно добавить в ответ. | Не указано |

Вложенная схема `postingFboPostingWithParams`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| analytics_data | boolean | Нет | Передайте `true`, чтобы добавить в ответ данные аналитики. | Не указано |
| financial_data | boolean | Нет | Передайте `true`, чтобы добавить в ответ финансовые данные. | Не указано |
| legal_info | boolean | Нет | Передайте `true`, чтобы добавить в ответ юридическую информацию. | Не указано |

```json
{
  "posting_number": "00000000-0000-1",
  "with": {
    "analytics_data": true,
    "financial_data": true
  }
}
```

### Response
Response schema: `v2FboPostingResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | v2FboPosting | Результат запроса. |
| result.additional_data | array<v2AdditionalDataItem> | Не указано |
| result.analytics_data | FboPostingFboPostingAnalyticsData | Данные аналитики. |
| result.analytics_data.city | string | Город доставки. Только для продавцов из СНГ. |
| result.analytics_data.delivery_type | string | Способ доставки. |
| result.analytics_data.is_legal | boolean | Получатель юридическое лицо:   - `true` — юридическое лицо,   - `false` — физическое лицо. |
| result.analytics_data.is_premium | boolean | Наличие подписки Premium. |
| result.analytics_data.payment_type_group_name | string | Способ оплаты:  - `картой онлайн`, - `карта Ozon Банка`, - `автосписание с карты Ozon Банка при выдаче`, - `сохранённой картой при получении`, - `Система Быстры |
| result.analytics_data.warehouse_id | integer | Идентификатор склада. |
| result.analytics_data.warehouse_name | string | Название склада отправки заказа. |
| result.analytics_data.client_delivery_date_begin | string | Дата и время начала доставки. Только для отправлений, оформленных через [Ozon Доставку](#tag/OzonLogistics). |
| result.analytics_data.client_delivery_date_end | string | Ожидаемая дата, до которой заказ будет доставлен. Только для отправлений, оформленных через [Ozon Доставку](#tag/OzonLogistics). |

---

## 14. POST /v4/posting/fbs/list

**Статус:** Актуальный.

### Блок аналитики
Продажи / заказы / отправления

### Назначение
Получить список FBS/rFBS-отправлений за период.

### Что закрывает в аналитике
posting_number, order_id, products, analytics_data, financial_data Нужно уточнить по response schema

### Когда вызывается
при обновлении продаж/заказов за период для FBS/rFBS

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `posting.v4.PostingFbsListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| cursor | string | Нет | Указатель для выборки следующих данных. | Не указано |
| filter | posting.v4.PostingFbsListRequest.Filter | Да | Фильтр. | Не указано |
| limit | integer | Да | Количество значений в ответе. | Не указано |
| sort_dir | posting.v4.PostingFbsListRequest.SortDir.Enum | Нет | Направление сортировки: - `ASC` — по возрастанию; - `DESC` — по убыванию. | Не указано |
| translit | boolean | Нет | `true`, чтобы включить транслитерацию адреса из кириллицы в латиницу. | Не указано |
| with | posting.v4.PostingFbsListRequest.With | Нет | Дополнительные поля, которые нужно добавить в ответ. | Не указано |

Вложенная схема `posting.v4.PostingFbsListRequest.Filter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| delivery_method_ids | array<string> | Нет | Идентификатор способа доставки. Можно получить с помощью метода [/v1/delivery-method/list](#operation/WarehouseAPI_DeliveryMethodList). | Не указано |
| is_blr_traceable | boolean | Нет | `true`, если товар отслеживаемый. | Не указано |
| last_changed_status_date | posting.v4.PostingFbsListRequest.Filter.LastChangedStatusDate | Нет | Период, в который последний раз изменялся статус у отправлений. | Не указано |
| order_id | integer | Нет | Идентификатор заказа. | Не указано |
| order_numbers | array<string> | Нет | Номера заказов, к которым относятся отправления. | Не указано |
| provider_ids | array<string> | Нет | Идентификатор службы доставки. Можно получить с помощью метода [/v1/delivery-method/list](#operation/WarehouseAPI_DeliveryMethodList). | Не указано |
| since | string | Да | Дата начала периода, за который нужно получить список отправлений. | Не указано |
| statuses | array<string> | Нет | Статус отправления: - `awaiting_registration` — ожидает регистрации; - `acceptance_in_progress` — идёт приёмка; - `awaiting_approve` — ожидает подтверждения; - `awaiting_packaging` — ожидает упаковки; - `awaiting_deliver` — ожидает отгрузки; - `arbi… | Не указано |
| to | string | Да | Дата конца периода, за который нужно получить список отправлений. | Не указано |
| warehouse_ids | array<string> | Нет | Идентификатор склада. Можно получить с помощью метода [/v1/warehouse/list](#operation/WarehouseAPI_WarehouseList). | Не указано |

Вложенная схема `posting.v4.PostingFbsListRequest.With`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| analytics_data | boolean | Нет | `true`, чтобы добавить в ответ данные аналитики. | Не указано |
| barcodes | boolean | Нет | `true`, чтобы добавить в ответ штрихкоды отправления. | Не указано |
| financial_data | boolean | Нет | `true`, чтобы добавить в ответ финансовые данные. | Не указано |
| legal_info | boolean | Нет | `true`, чтобы добавить в ответ юридическую информацию. | Не указано |

```json
{
  "filter": {
    "since": "2026-07-01T00:00:00Z",
    "to": "2026-07-02T00:00:00Z"
  },
  "limit": 1000,
  "cursor": "",
  "with": {
    "analytics_data": true,
    "financial_data": true
  }
}
```

### Response
Response schema: `posting.v4.PostingFbsListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| cursor | string | Указатель для выборки следующих данных. |
| has_next | boolean | `true`, если в ответе вернулись не все отправления. |
| postings | object | Список отправлений. |

---

## 15. POST /v3/posting/fbs/list

**Статус:** Deprecated. Актуальный аналог использовать только если он есть в swagger.
**Актуальный аналог в swagger:** `POST /v4/posting/fbs/list`.

### Блок аналитики
Продажи / заказы / отправления

### Назначение
Старый метод списка FBS-отправлений.

### Что закрывает в аналитике
posting_number, products, analytics_data, financial_data; метод устаревший

### Когда вызывается
не использовать в новой реализации, только legacy fallback

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `postingv3GetFbsPostingListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| dir | string | Нет | Направление сортировки:   - `asc` — по возрастанию,   - `desc` — по убыванию. | Не указано |
| filter | postingv3GetFbsPostingListRequestFilter | Да | Фильтр. | Не указано |
| limit | integer | Да | Количество значений в ответе:   - максимум — 1000,   - минимум — 1. | Не указано |
| offset | integer | Да | Количество элементов, которое будет пропущено в ответе. Например, если `offset = 10`, то ответ начнётся с 11-го найденного элемента. | Не указано |
| with | postingv3FbsPostingWithParams | Нет | Дополнительные поля, которые нужно добавить в ответ. | Не указано |

Вложенная схема `postingv3GetFbsPostingListRequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| delivery_method_id | array<integer> | Нет | Идентификатор способа доставки. Можно получить с помощью метода [/v1/delivery-method/list](#operation/WarehouseAPI_DeliveryMethodList). | Не указано |
| is_blr_traceable | boolean | Нет | `true`, если товар прослеживаемый. | Не указано |
| is_quantum | boolean | Нет | Укажите `true`, чтобы получить только отправления квантов.  По умолчанию — `false`, в ответе придут все отправления. | Не указано |
| order_id | integer | Нет | Идентификатор заказа. | Не указано |
| provider_id | array<integer> | Нет | Идентификатор службы доставки. Можно получить с помощью метода [/v1/delivery-method/list](#operation/WarehouseAPI_DeliveryMethodList). | Не указано |
| since | string | Да | Дата начала периода, за который нужно получить список отправлений.  Формат UTC: ГГГГ-ММ-ДДTЧЧ:ММ:ССZ.  Пример: 2019-08-24T14:15:22Z. | Не указано |
| to | string | Да | Дата конца периода, за который нужно получить список отправлений.  Формат UTC: ГГГГ-ММ-ДДTЧЧ:ММ:ССZ.  Пример: 2019-08-24T14:15:22Z. | Не указано |
| status | string | Нет | Статус отправления: - `awaiting_registration` — ожидает регистрации, - `acceptance_in_progress` — идёт приёмка, - `awaiting_approve` — ожидает подтверждения, - `awaiting_packaging` — ожидает упаковки, - `awaiting_deliver` — ожидает отгрузки, - `arbi… | Не указано |
| warehouse_id | array<string> | Нет | Идентификатор склада. Можно получить с помощью метода [/v1/warehouse/list](#operation/WarehouseAPI_WarehouseList). | Не указано |
| last_changed_status_date | postinglistV3status | Нет | Период, в который последний раз изменялся статус у отправлений. | Не указано |

Вложенная схема `postingv3FbsPostingWithParams`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| analytics_data | boolean | Нет | Добавить в ответ данные аналитики. | Не указано |
| barcodes | boolean | Нет | Добавить в ответ штрихкоды отправления. | Не указано |
| financial_data | boolean | Нет | Добавить в ответ финансовые данные. | Не указано |
| legal_info | boolean | Нет | Добавить в ответ юридическую информацию. | Не указано |
| translit | boolean | Нет | Выполнить транслитерацию возвращаемых значений. | Не указано |

```json
{
  "filter": {
    "since": "2026-07-01T00:00:00Z",
    "to": "2026-07-02T00:00:00Z"
  },
  "limit": 1000,
  "offset": 0,
  "with": {
    "analytics_data": true,
    "financial_data": true
  }
}
```

### Response
Response schema: `v3GetFbsPostingListResponseV3`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | v3GetFbsPostingListResponseV3Result | Массив отправлений. |
| result.has_next | boolean | Признак, что в ответе вернули не весь массив отправлений: - `true` — необходимо сделать новый запрос с другим значением `offset`, чтобы получить информацию об о |
| result.postings | array<v3FbsPosting> | Информация об отправлении. |

---

## 16. POST /v3/posting/fbs/get

**Статус:** Актуальный.

### Блок аналитики
Продажи / заказы / отправления

### Назначение
Получить детализацию конкретного FBS/rFBS-отправления.

### Что закрывает в аналитике
posting_number, products, analytics_data, financial_data, status

### Когда вызывается
при открытии конкретного заказа/отправления или отладке расхождений

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `postingv3GetFbsPostingRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| posting_number | string | Да | Идентификатор отправления. | Не указано |
| with | postingv3FbsPostingWithParamsExamplars | Нет | Дополнительные поля, которые нужно добавить в ответ. | Не указано |

Вложенная схема `postingv3FbsPostingWithParamsExamplars`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| analytics_data | boolean | Нет | Добавить в ответ данные аналитики. | Не указано |
| barcodes | boolean | Нет | Добавить в ответ штрихкоды отправления. | Не указано |
| financial_data | boolean | Нет | Добавить в ответ финансовые данные. | Не указано |
| legal_info | boolean | Нет | Добавить в ответ юридическую информацию. | Не указано |
| product_exemplars | boolean | Нет | Добавить в ответ данные о продуктах и их экземплярах. | Не указано |
| related_postings | boolean | Нет | Добавить в ответ номера связанных отправлений. Связанные отправления — те, на которое было разделено родительское отправление при сборке. | Не указано |
| translit | boolean | Нет | Выполнить транслитерацию возвращаемых значений. | Не указано |

```json
{
  "posting_number": "00000000-0000-1",
  "with": {
    "analytics_data": true,
    "financial_data": true
  }
}
```

### Response
Response schema: `v3GetFbsPostingResponseV3`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | v3FbsPostingDetail | Информация об отправлении. |
| result.additional_data | array<v3AdditionalDataItem> | Не указано |
| result.addressee | v3Addressee | Контактные данные получателя. |
| result.addressee.name | string | Имя покупателя. |
| result.addressee.phone | string | Подменный контактный телефон получателя.   [Подробнее о подменных номерах в Базе знаний](https://seller-edu.ozon.ru/rfbs/orders-cancellations/replacement-number |
| result.addressee.pin | string | Добавочный номер телефона получателя, вводится в тональном режиме. Только для отправлений realFBS со службами доставки:   - `3pl_tracking` — доставка внешней сл |
| result.analytics_data | v3FbsPostingAnalyticsData | Данные аналитики. |
| result.analytics_data.city | string | Город доставки. Только для отправлений rFBS и продавцов из СНГ. |
| result.analytics_data.delivery_date_begin | string | Дата и время начала доставки. |
| result.analytics_data.delivery_date_end | string | Дата и время конца доставки. |
| result.analytics_data.delivery_type | string | Способ доставки. |
| result.analytics_data.is_legal | boolean | Признак, что получатель юридическое лицо:   - `true` — юридическое лицо,   - `false` — физическое лицо. |

---

## 17. POST /v3/finance/transaction/list

**Статус:** Актуальный.

### Блок аналитики
Финансы / начисления / поступления

### Назначение
Получить список финансовых транзакций.

### Что закрывает в аналитике
accruals_for_sale, amount, sale_commission, services, delivery_charge, return_delivery_charge, operation_type, posting_number, items

### Когда вызывается
главный метод для расчёта фактической прибыли по SKU/периоду

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `financev3FinanceTransactionListV3Request`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| filter | FinanceTransactionListV3RequestFilter | Нет | Фильтр. | Не указано |
| page | integer | Да | Номер страницы, возвращаемой в запросе. | Не указано |
| page_size | integer | Да | Количество элементов на странице. | Не указано |

Вложенная схема `FinanceTransactionListV3RequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| date | FilterPeriod | Нет | Фильтр по дате. | Не указано |
| operation_type | array<string> | Нет | Тип операции:   - `ClientReturnAgentOperation` — получение возврата, отмены, невыкупа от покупателя;   - `MarketplaceMarketingActionCostOperation` — услуги продвижения товаров;   - `MarketplaceSaleReviewsOperation` — приобретение отзывов на платформ… | Не указано |
| posting_number | string | Нет | Номер отправления. | Не указано |
| transaction_type | string | Нет | Тип начисления:   - `all` — все,   - `orders` — заказы,   - `returns` — возвраты и отмены,   - `services` — сервисные сборы,   - `compensation` — компенсация,   - `transferDelivery` — стоимость доставки,   - `other` — прочее.  Некоторые операции мог… | Не указано |

```json
{
  "filter": {
    "date": {
      "from": "2026-07-01T00:00:00Z",
      "to": "2026-07-02T00:00:00Z"
    },
    "transaction_type": "all"
  },
  "page": 1,
  "page_size": 1000
}
```

### Response
Response schema: `financev3FinanceTransactionListV3Response`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | financev3FinanceTransactionListV3ResponseResult | Результаты запроса. |
| result.operations | array<FinanceTransactionListV3ResponseOperation> | Информация об операциях. |
| result.page_count | integer | Количество страниц. Если 0, страниц больше нет. |
| result.row_count | integer | Количество транзакций на всех страницах. Если 0, транзакций больше нет. |

---

## 18. POST /v3/finance/transaction/totals

**Статус:** Актуальный.

### Блок аналитики
Финансы / начисления / поступления

### Назначение
Получить агрегированные суммы транзакций.

### Что закрывает в аналитике
accruals_for_sale, sale_commission, services_amount, refunds_and_cancellations, compensation_amount, others_amount

### Когда вызывается
для KPI dashboard и быстрой сверки суммы операций

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `financev3FinanceTransactionTotalsV3Request`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| date | FinanceTransactionTotalsV3RequestDate | Нет | Фильтр по дате. | Не указано |
| posting_number | string | Нет | Номер отправления. | Не указано |
| transaction_type | string | Нет | Тип операции:  - `all` — все,  - `orders` — заказы,  - `returns` — возвраты и отмены,  - `services` — сервисные сборы,  - `compensation` — компенсация,  - `transferDelivery` — стоимость доставки,  - `other` — прочее. | Не указано |

Вложенная схема `FinanceTransactionTotalsV3RequestDate`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| from | string | Нет | Начало периода.  Формат: `YYYY-MM-DDTHH:mm:ss.sssZ`.<br> Пример: `2019-11-25T10:43:06.51`. | Не указано |
| to | string | Нет | Конец периода.  Формат: `YYYY-MM-DDTHH:mm:ss.sssZ`.<br> Пример: `2019-11-25T10:43:06.51`. | Не указано |

```json
{
  "date": {
    "from": "2026-07-01T00:00:00Z",
    "to": "2026-07-02T00:00:00Z"
  },
  "transaction_type": "all"
}
```

### Response
Response schema: `financev3FinanceTransactionTotalsV3Response`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | financev3FinanceTransactionTotalsV3ResponseResult | Результаты запроса. |
| result.accruals_for_sale | number | Общая стоимость товаров и возвратов в заданный период. |
| result.compensation_amount | number | Компенсации. |
| result.money_transfer | number | Начисления за доставку и возвраты при работе по схеме «Доставка по выбору продавца». |
| result.others_amount | number | Прочие начисления. |
| result.processing_and_delivery | number | Стоимость услуг обработки отправлений, сборки заказов, магистрали и последней мили, а также доставки до введения новых комиссий и тарифов с 1 февраля 2021 года. |
| result.refunds_and_cancellations | number | Стоимость обратной магистрали, обработки возвратов, отмен и невыкупа товара, а также возвратов до введения новых комиссий и тарифов с 1 февраля 2021 года.  Маги |
| result.sale_commission | number | Сумма комиссии, которая была удержана при продаже товара и возвращена при его возврате. |
| result.services_amount | number | Стоимость дополнительных услуг, не связанных напрямую с доставками и возвратами товаров. Например, продвижения или размещения товаров. |

---

## 19. POST /v2/finance/realization

**Статус:** Актуальный.

### Блок аналитики
Финансы / начисления / поступления

### Назначение
Получить отчёт о реализации товаров за месяц.

### Что закрывает в аналитике
offer_id, sku, seller_price_per_instance, delivery_commission, return_commission, commission_ratio

### Когда вызывается
для бухгалтерской сверки реализации и комиссий по месяцу

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v2GetRealizationReportRequestV2`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| month | integer | Да | Месяц. | Не указано |
| year | integer | Да | Год. | Не указано |

```json
{
  "month": 7,
  "year": 2026
}
```

### Response
Response schema: `v2GetRealizationReportResponseV2`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | GetRealizationReportResponseV2Result | Результат запроса. |
| result.header | GetRealizationReportResponseV2Header | Титульный лист отчёта. |
| result.header.contract_date | string | Дата заключения договора. |
| result.header.contract_number | string | Номер договора. |
| result.header.currency_sys_name | string | Валюта. |
| result.header.doc_date | string | Дата формирования документа. |
| result.header.number | string | Номер отчёта о реализации. |
| result.header.payer_inn | string | ИНН плательщика. |
| result.header.payer_kpp | string | КПП плательщика. |
| result.header.payer_name | string | Название плательщика. |
| result.header.receiver_inn | string | ИНН получателя. |
| result.header.receiver_kpp | string | КПП получателя. |

---

## 20. POST /v1/finance/realization/posting

**Статус:** Актуальный.

### Блок аналитики
Финансы / начисления / поступления

### Назначение
Получить позаказный отчёт о реализации товаров.

### Что закрывает в аналитике
offer_id, sku, posting_number, seller_price_per_instance, delivery_commission, return_commission

### Когда вызывается
для сверки прибыли по заказам и SKU

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1GetRealizationReportPostingRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| month | integer | Да | Месяц. | Не указано |
| year | integer | Да | Год. | Не указано |

```json
{
  "month": 7,
  "year": 2026
}
```

### Response
Response schema: `v1GetRealizationReportPostingResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| header | GetRealizationReportResponseV2Header | Титульный лист отчёта. |
| header.contract_date | string | Дата заключения договора. |
| header.contract_number | string | Номер договора. |
| header.currency_sys_name | string | Валюта. |
| header.doc_date | string | Дата формирования документа. |
| header.number | string | Номер отчёта о реализации. |
| header.payer_inn | string | ИНН плательщика. |
| header.payer_kpp | string | КПП плательщика. |
| header.payer_name | string | Название плательщика. |
| header.receiver_inn | string | ИНН получателя. |
| header.receiver_kpp | string | КПП получателя. |
| header.receiver_name | string | Название получателя. |

---

## 21. POST /v1/finance/cash-flow-statement/list

**Статус:** Актуальный.

### Блок аналитики
Финансы / начисления / поступления

### Назначение
Получить финансовый отчёт по денежному потоку.

### Что закрывает в аналитике
payments.payment, invoice_transfer, begin_balance_amount, end_balance_amount, delivery, return, services, others

### Когда вызывается
для поступлений на расчётный счёт, сверки выплат и баланса

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v3FinanceCashFlowStatementListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| date | financev3Period | Да | Период формирования отчёта. | Не указано |
| page | integer | Да | Номер страницы, возвращаемой в запросе. | Не указано |
| with_details | boolean | Нет | `true`, если нужно добавить дополнительные параметры в ответ. | Не указано |
| page_size | integer | Да | Количество элементов на странице. | Не указано |

Вложенная схема `financev3Period`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| from | string | Да | Дата, с ĸоторой рассчитывается отчёт. | Не указано |
| to | string | Да | Дата, по ĸоторую рассчитывается отчёт. | Не указано |

```json
{
  "date": {
    "from": "2026-07-01T00:00:00Z",
    "to": "2026-07-31T23:59:59Z"
  },
  "page": 1,
  "page_size": 1000,
  "with_details": true
}
```

### Response
Response schema: `v3FinanceCashFlowStatementListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | v3FinanceCashFlowStatementListResponseResult | Результат работы метода. |
| result.cash_flows | object | Список отчётов. |
| result.details | FinanceCashFlowStatementListResponseDetails | Детализированная информация. |
| result.details.begin_balance_amount | number | Баланс на начало периода. |
| result.details.delivery | DetailsDeliveryDetails | Заказы. |
| result.details.invoice_transfer | number | Сумма к выплате за период. |
| result.details.loan | number | Перевод по договорам займа. |
| result.details.payments | DetailsPayment | Выплачено за период. |
| result.details.period | v3FinanceCashFlowStatementListResponsePeriod | Период. |
| result.details.return | DetailsReturnDetails | Возвраты и отмены. |
| result.details.rfbs | DetailsRfbsDetails | Перечисления по схеме rFBS. |
| result.details.services | DetailsService | Услуги. |

---

## 22. POST /v1/finance/mutual-settlement

**Статус:** Актуальный.

### Блок аналитики
Финансы / начисления / поступления

### Назначение
Сформировать отчёт о взаиморасчётах.

### Что закрывает в аналитике
взаиморасчёты; файл отчёта через /v1/report/info

### Когда вызывается
для бухгалтерской сверки начислений/удержаний за месяц

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1CreateMutualSettlementReportRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| date | string | Да | Отчётный период в формате `YYYY-MM`. | Не указано |
| language | commonLanguage | Нет | Язык ответа:   - `RU` — русский,   - `EN` — английский. | DEFAULT |

```json
{
  "date": "2026-07",
  "language": "RU"
}
```

### Response
Response schema: `commonCreateReportResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | CreateReportResponseCode | Результаты запроса. |
| result.code | string | Уникальный идентификатор отчёта. По нему вы можете получить отчёт в течение 3 дней после запроса. Чтобы получить отчёт, передайте это значение в метод [/v1/repo |

---

## 23. POST /v1/finance/products/buyout

**Статус:** Актуальный.

### Блок аналитики
Финансы / начисления / поступления

### Назначение
Получить отчёт о выкупленных товарах.

### Что закрывает в аналитике
offer_id, sku, posting_number, quantity, buyout_price, amount, seller_price_per_instance

### Когда вызывается
для проверки фактически выкупленных товаров и количества продаж

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1GetFinanceProductsBuyoutRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| date_from | string | Да | Дата, с которой будут данные в отчёте. | Не указано |
| date_to | string | Да | Дата, по которую будут данные в отчёте.  Максимальный период — 31 день. | Не указано |

```json
{
  "date_from": "2026-07-01",
  "date_to": "2026-07-31"
}
```

### Response
Response schema: `v1GetFinanceProductsBuyoutResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| products | array<GetFinanceProductsBuyoutResponseProduct> | Список выкупленных товаров |
| products[].amount | number | Сумма к начислению. |
| products[].buyout_price | number | Цена выкупа товара с НДС. |
| products[].deduction_by_category_percent | number | Скидка по категории в процентах. |
| products[].name | string | Название товара. |
| products[].offer_id | string | Идентификатор товара в системе продавца — артикул. |
| products[].posting_number | string | Номер отправления. |
| products[].quantity | integer | Количество товара. |
| products[].seller_price_per_instance | number | Цена продавца с учётом скидки. |
| products[].sku | integer | Идентификатор товара в системе Ozon — SKU. |
| products[].vat_percent | integer | Ставка НДС для товара в процентах. |

---

## 24. POST /v1/returns/list

**Статус:** Актуальный.

### Блок аналитики
Возвраты

### Назначение
Получить информацию о возвратах FBO и FBS.

### Что закрывает в аналитике
returns, type, schema, posting_number, product.sku, product.offer_id, product.price, commission, quantity, logistic

### Когда вызывается
при обновлении возвратов за период и минусовании прибыли

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1GetReturnsListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| filter | GetReturnsListRequestFilter | Нет | Фильтры. Используйте только один фильтр в запросе: `logistic_return_date`, `storage_tariffication_start_date` или `visual_status_change_moment`, иначе вернётся ошибка. | Не указано |
| limit | integer | Да | Количество подгружаемых возвратов. Максимальное значение — 500. | Не указано |
| last_id | integer | Нет | Идентификатор последнего подгруженного возврата. | Не указано |

Вложенная схема `GetReturnsListRequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| logistic_return_date | v1TimeRange_return_date | Нет | Фильтр по дате создания возврата. | Не указано |
| storage_tariffication_start_date | v1TimeRange_storage_tariffication | Нет | Фильтр по дате начала тарификации. | Не указано |
| visual_status_change_moment | v1TimeRange_visual_status | Нет | Фильтр по дате изменения статуса возврата. | Не указано |
| order_id | integer | Нет | Фильтр по идентификатору заказа. | Не указано |
| posting_numbers | array<string> | Нет | Фильтр по номеру отправления. Передавайте не больше 50 постингов. | Не указано |
| product_name | string | Нет | Фильтр по названию товара. | Не указано |
| offer_id | string | Нет | Фильтр по артикулу товара. | Не указано |
| visual_status_name | string | Нет | Фильтр по статусу возврата: - `DisputeOpened` — открыт спор с покупателем; - `OnSellerApproval` — на согласовании у продавца; - `ArrivedAtReturnPlace` — в пункте выдачи; - `OnSellerClarification` — на уточнении у продавца; - `OnSellerClarificationAf… | Не указано |
| warehouse_id | integer | Нет | Фильтр по идентификатору склада. Можно получить с помощью метода [/v1/warehouse/list](#operation/WarehouseAPI_WarehouseList). | Не указано |
| barcode | string | Нет | Фильтр по штрихкоду возвратной этикетки. | Не указано |
| return_schema | string | Нет | Фильтр по схеме доставки: `FBS` или `FBO`. | Не указано |
| compensation_status_id | integer | Нет | Фильтр по статусу компенсации: - `1` — отправлена; - `2` — получена; - `3` — отменена; - `4` — проведена декомпенсация. | Не указано |

```json
{
  "filter": {
    "date": {
      "from": "2026-07-01T00:00:00Z",
      "to": "2026-07-31T23:59:59Z"
    }
  },
  "limit": 500,
  "last_id": 0
}
```

### Response
Response schema: `v1GetReturnsListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| returns | array<GetReturnsListResponseReturnsItem> | Информация о возвратах. |
| returns[].exemplars | array<GetReturnsListResponseExemplar> | Информация об экземплярах. |
| returns[].id | integer | Идентификатор возврата. |
| returns[].company_id | integer | Идентификатор продавца. |
| returns[].return_reason_name | string | Причина возврата или отмены. |
| returns[].type | string | Тип возврата:  `Cancellation` - отмена (до вручения); `FullReturn` - полный отказ при вручении; `PartialReturn` - частичный отказ при вручении; `ClientReturn` - |
| returns[].schema | string | Схема возврата: `FBS`; `FBO`. |
| returns[].order_id | integer | Идентификатор заказа. |
| returns[].order_number | string | Номер заказа. |
| returns[].place | GetReturnsListResponsePlace_now | Склад, где находится возврат. |
| returns[].target_place | GetReturnsListResponsePlace_target | Склад, куда едет возврат. |
| returns[].storage | GetReturnsListResponseStorage | Информация о хранении. |

---

## 25. POST /v2/returns/rfbs/list

**Статус:** Актуальный.

### Блок аналитики
Возвраты

### Назначение
Получить список заявок на возврат rFBS.

### Что закрывает в аналитике
return_id, posting_number, order_number, product.sku, product.offer_id, product.price, state

### Когда вызывается
при обновлении возвратов rFBS

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v2ReturnsRfbsListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| filter | v2ReturnsRfbsFilter | Нет | Фильтр. | Не указано |
| last_id | integer | Нет | Идентификатор последнего значения на странице — `return_id`. Оставьте это поле пустым при выполнении первого запроса. | Не указано |
| limit | integer | Да | Количество значений в ответе. | Не указано |

Вложенная схема `v2ReturnsRfbsFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| offer_id | string | Нет | Идентификатор товара в системе продавца — артикул. | Не указано |
| posting_number | string | Нет | Номер отправления. | Не указано |
| group_state | array<string> | Нет | Фильтр по статусам заявок: - `All` — все заявки. - `New` — новые. - `Delivering` — в пути. - `Checkout` — на проверке. - `Arbitration` — спорные. - `Approved` — согласованные. - `Rejected` — отклонённые. | Не указано |
| created_at | CreatedAt | Нет | Период создания заявки. | Не указано |

```json
{
  "filter": {
    "created_at": {
      "from": "2026-07-01T00:00:00Z",
      "to": "2026-07-31T23:59:59Z"
    }
  },
  "limit": 500,
  "last_id": 0
}
```

### Response
Response schema: `v2ReturnsRfbsListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| returns | ReturnsRfbsListResponseReturns | Данные о заявках. |
| returns.client_name | string | Имя покупателя. |
| returns.created_at | string | Дата создания заявки. |
| returns.order_number | string | Номер заказа. |
| returns.posting_number | string | Номер отправления. |
| returns.product | v2Product | Данные о товаре. |
| returns.product.name | string | Название товара. |
| returns.product.offer_id | string | Идентификатор товара в системе продавца — артикул. |
| returns.product.currency_code | string | Валюта ваших цен. Cовпадает с валютой, которая установлена в настройках личного кабинета.  Возможные значения:    - `RUB` — российский рубль,   - `BYN` — белору |
| returns.product.price | integer | Цена товара. |
| returns.product.sku | integer | Идентификатор товара в системе Ozon — SKU. |
| returns.return_id | integer | Идентификатор заявки на возврат. |

---

## 26. POST /v1/returns/company/fbs/info

**Статус:** Актуальный.

### Блок аналитики
Возвраты

### Назначение
Получить количество возвратов FBS по drop-off пунктам.

### Что закрывает в аналитике
returns_count, drop_off_points, warehouses_ids

### Когда вызывается
для оперативного виджета по ожидающим возвратам FBS

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1ReturnsCompanyFbsInfoRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| filter | v1ReturnsCompanyFbsInfoRequestFilter | Нет | Фильтры. | Не указано |
| pagination | ReturnsCompanyFbsInfoRequestPagination | Да | Разделение ответа метода. | Не указано |

Вложенная схема `v1ReturnsCompanyFbsInfoRequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| place_id | integer | Нет | Фильтр по идентификатору drop-off пункта. | Не указано |

Вложенная схема `ReturnsCompanyFbsInfoRequestPagination`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| last_id | integer | Нет | Идентификатор последнего drop-off пункта на странице. Для первого запроса оставьте это поле пустым.  Чтобы получить следующие значения, укажите `id` последнего drop-off пункта из ответа предыдущего запроса. | Не указано |
| limit | integer | Да | Количество drop-off пунктов на странице. Максимум — 500. | Не указано |

```json
{
  "filter": {},
  "pagination": {
    "limit": 100,
    "offset": 0
  }
}
```

### Response
Response schema: `v1ReturnsCompanyFbsInfoResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| drop_off_points | array<ReturnsCompanyFbsInfoResponseDropOffPoints> | Информация о drop-off пунктах. |
| drop_off_points[].address | string | Адрес drop-off пункта. |
| drop_off_points[].box_count | integer | Количество коробок в drop-off пункте. |
| drop_off_points[].id | integer | Идентификатор drop-off пункта. |
| drop_off_points[].name | string | Название drop-off пункта. |
| drop_off_points[].pass_info | ReturnsCompanyFbsInfoResponsePass_info | Информация о пропуске. |
| drop_off_points[].place_id | integer | Идентификатор склада, на который приедет отгрузка. |
| drop_off_points[].returns_count | integer | Количество возвратов в drop-off пункте. |
| drop_off_points[].utc_offset | string | Смещение часового пояса времени отгрузки от UTC-0. |
| drop_off_points[].warehouses_ids | array<string> | Идентификатор складов продавца. |
| has_next | boolean | Признак, есть ли ещё пункты, где продавца ожидают возвраты. |

---

## 27. POST /v1/report/products/create

**Статус:** Актуальный.

### Блок аналитики
Отчёты

### Назначение
Создать отчёт по товарам.

### Что закрывает в аналитике
offer_id, sku, visibility; файл отчёта через /v1/report/info

### Когда вызывается
для массовой выгрузки каталога и сверки с API-синхронизацией

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `reportCreateCompanyProductsReportRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| language | reportLanguage | Нет | Язык ответа:   - `RU` — русский,   - `EN` — английский. | DEFAULT |
| offer_id | array<string> | Нет | Идентификатор товара в системе продавца — артикул. | Не указано |
| search | string | Нет | Поиск по содержанию записи, проверяет наличие. | Не указано |
| sku | array<integer> | Нет | Идентификатор товара в системе Ozon — SKU. | Не указано |
| visibility | reportCreateCompanyProductsReportRequestVisibility | Нет | Фильтр по видимости товара:   - `ALL` — все товары, кроме архивных;   - `VALIDATION_STATE_FAIL` — товары, которые не прошли проверку валидатором на премодерации;   - `TO_SUPPLY` — товары, готовые к продаже;   - `IN_SALE` — товары в продаже;   - `REM… | ALL |

```json
{
  "language": "RU",
  "visibility": "ALL"
}
```

### Response
Response schema: `reportCreateReportResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | CreateReportResponseCode | Результаты запроса. |
| result.code | string | Уникальный идентификатор отчёта. По нему вы можете получить отчёт в течение 3 дней после запроса. Чтобы получить отчёт, передайте это значение в метод [/v1/repo |

---

## 28. POST /v1/report/postings/create

**Статус:** Актуальный.

### Блок аналитики
Отчёты

### Назначение
Создать отчёт об отправлениях.

### Что закрывает в аналитике
processed_at_from/to, delivery_schema, offer_id, sku, statuses, warehouse_id

### Когда вызывается
для выгрузки отправлений за период и сверки с posting list

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `reportCreateCompanyPostingsReportRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| filter | reportCreateCompanyPostingsReportRequestFilter | Да | Фильтр. | Не указано |
| language | reportLanguage | Нет | Язык ответа:   - `RU` — русский,   - `EN` — английский. | DEFAULT |
| with | CreateCompanyPostingsReportRequestWith | Нет | Дополнительные поля, которые нужно добавить в ответ. | Не указано |

Вложенная схема `reportCreateCompanyPostingsReportRequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| cancel_reason_id | array<integer> | Нет | Идентификатор причины отмены. | Не указано |
| delivery_schema | array<string> | Нет | Схема работы — FBO или FBS.  За один запрос вы можете передать только одно значение: * `fbo` — чтобы получить отчёт по схеме FBO, * `fbs` — чтобы получить отчёт по схеме FBS. | Не указано |
| offer_id | string | Нет | Идентификатор товара в системе продавца — артикул. | Не указано |
| processed_at_from | string | Да | Время, когда заказ попал в обработку. | Не указано |
| processed_at_to | string | Да | Время, когда заказ появился в личном кабинете. | Не указано |
| sku | array<integer> | Нет | Идентификатор товара в системе Ozon — SKU. | Не указано |
| status_alias | array<string> | Нет | Текст статуса. | Не указано |
| statuses | array<integer> | Нет | Числовой статус. | Не указано |
| title | string | Нет | Название товара. | Не указано |
| warehouse_id | array<integer> | Нет | Идентификатор склада. | Не указано |
| delivery_method_id | array<integer> | Нет | Идентификатор способа доставки. Получите методом [/v1/delivery-method/list](#operation/WarehouseAPI_DeliveryMethodList). | Не указано |
| is_express | bool | Нет | Экспресс-доставка: - `true` — только отправления с доставкой Ozon Express; - `false` — только отправления без доставки Ozon Express.  Если ничего не передать, вернутся все отправления. | Не указано |

Вложенная схема `CreateCompanyPostingsReportRequestWith`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| additional_data | boolean | Нет | `true`, чтобы добавить в ответ дополнительную информацию. | Не указано |
| analytics_data | boolean | Нет | `true`, чтобы добавить в ответ аналитику. Передайте значение `filter.delivery_schema = fbs`, иначе вернётся ошибка. | Не указано |
| customer_data | boolean | Нет | `true`, чтобы добавить в ответ информацию о покупателе. | Не указано |
| jewelry_codes | boolean | Нет | `true`, чтобы добавить в ответ информацию о ювелирных изделиях. | Не указано |

```json
{
  "filter": {
    "processed_at_from": "2026-07-01T00:00:00Z",
    "processed_at_to": "2026-07-31T23:59:59Z",
    "delivery_schema": [
      "fbo"
    ]
  },
  "language": "RU",
  "with": {
    "analytics_data": true,
    "financial_data": true
  }
}
```

### Response
Response schema: `reportCreateReportResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | CreateReportResponseCode | Результаты запроса. |
| result.code | string | Уникальный идентификатор отчёта. По нему вы можете получить отчёт в течение 3 дней после запроса. Чтобы получить отчёт, передайте это значение в метод [/v1/repo |

---

## 29. POST /v2/report/returns/create

**Статус:** Актуальный.

### Блок аналитики
Отчёты

### Назначение
Создать отчёт о возвратах.

### Что закрывает в аналитике
delivery_schema, date_from, date_to, status; файл отчёта через /v1/report/info

### Когда вызывается
для выгрузки возвратов за период

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v2ReportReturnsCreateRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| filter | v2ReportReturnsCreateRequestFilter | Да | Фильтр. | Не указано |
| language | reportLanguage | Нет | Язык ответа:   - `RU` — русский,   - `EN` — английский. | DEFAULT |

Вложенная схема `v2ReportReturnsCreateRequestFilter`:
| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| delivery_schema | string | Нет | Фильтр по схеме работы:  - `FBS` — возвраты на свой склад.  - `FBO` — возвраты на склад маркетплейса. - `ALL` — все возвраты. | Не указано |
| date_from | string | Да | Дата, с которой данные отображаются в отчёте.  Доступно только за последние три месяца. | Не указано |
| date_to | string | Да | Дата, по которую данные отображаются в отчёте.  Доступно только за последние три месяца. | Не указано |
| status | string | Да | Фильтр по статусу возврата: - `DisputeOpened` — открыт спор с покупателем; - `OnSellerApproval` — на согласовании у продавца; - `ArrivedAtReturnPlace` — в пункте выдачи; - `OnSellerClarification` — на уточнении у продавца; - `OnSellerClarificationAf… | Не указано |

```json
{
  "filter": {
    "date_from": "2026-07-01T00:00:00Z",
    "date_to": "2026-07-31T23:59:59Z",
    "status": "Approved",
    "delivery_schema": "ALL"
  },
  "language": "RU"
}
```

### Response
Response schema: `v2ReportReturnsCreateResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | CreateReportResponseCode | Результаты запроса. |
| result.code | string | Уникальный идентификатор отчёта. По нему вы можете получить отчёт в течение 3 дней после запроса. Чтобы получить отчёт, передайте это значение в метод [/v1/repo |

---

## 30. POST /v1/report/warehouse/stock

**Статус:** Актуальный.

### Блок аналитики
Отчёты

### Назначение
Создать отчёт об остатках на FBS-складе.

### Что закрывает в аналитике
warehouseId, stock report file

### Когда вызывается
для сверки FBS-остатков по складам

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1CreateStockByWarehouseReportRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| language | reportLanguage | Нет | Язык ответа:   - `RU` — русский,   - `EN` — английский. | DEFAULT |
| warehouseId | array<string> | Да | Идентификаторы складов. Ограничение значений в запросе. Максимум — 50. | Не указано |

```json
{
  "warehouseId": [
    "123456789"
  ],
  "language": "RU"
}
```

### Response
Response schema: `commonCreateReportResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | CreateReportResponseCode | Результаты запроса. |
| result.code | string | Уникальный идентификатор отчёта. По нему вы можете получить отчёт в течение 3 дней после запроса. Чтобы получить отчёт, передайте это значение в метод [/v1/repo |

---

## 31. POST /v1/report/placement/by-products/create

**Статус:** Актуальный.

### Блок аналитики
Отчёты

### Назначение
Создать отчёт о стоимости размещения по товарам.

### Что закрывает в аналитике
placement cost by products; code отчёта

### Когда вызывается
для учёта расходов на размещение в прибыли по SKU

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1CreatePlacementByProductsReportRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| date_from | string | Да | Дата начала отчётного периода в формате `YYYY-MM-DD`. | Не указано |
| date_to | string | Да | Дата окончания отчётного периода в формате `YYYY-MM-DD`.  Максимальный период — 31 день. | Не указано |

```json
{
  "date_from": "2026-07-01",
  "date_to": "2026-07-31"
}
```

### Response
Response schema: `v1CreatePlacementByProductsReportResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| code | string | Уникальный идентификатор отчёта. Чтобы получить отчёт, передайте это значение в метод [/v1/report/info](#operation/ReportAPI_ReportInfo). |

---

## 32. POST /v1/report/placement/by-supplies/create

**Статус:** Актуальный.

### Блок аналитики
Отчёты

### Назначение
Создать отчёт о стоимости размещения по поставкам.

### Что закрывает в аналитике
placement cost by supplies; code отчёта

### Когда вызывается
для сверки расходов на размещение по поставкам

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1CreatePlacementBySuppliesReportRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| date_from | string | Да | Дата начала отчётного периода в формате `YYYY-MM-DD`. | Не указано |
| date_to | string | Да | Дата окончания отчётного периода в формате `YYYY-MM-DD`.  Максимальный период — 31 день. | Не указано |

```json
{
  "date_from": "2026-07-01",
  "date_to": "2026-07-31"
}
```

### Response
Response schema: `v1CreatePlacementBySuppliesReportResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| code | string | Уникальный идентификатор отчёта. Чтобы получить отчёт, передайте это значение в метод [/v1/report/info](#operation/ReportAPI_ReportInfo). |

---

## 33. POST /v1/report/info

**Статус:** Актуальный.

### Блок аналитики
Отчёты

### Назначение
Получить статус и ссылку на файл отчёта.

### Что закрывает в аналитике
code, status, file, report_type, error, expires_at

### Когда вызывается
после create-методов отчётов

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `reportReportInfoRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| code | string | Да | Уникальный идентификатор отчёта. | Не указано |

```json
{
  "code": "report-code"
}
```

### Response
Response schema: `reportReportInfoResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | reportReportinfo | Информация об отчёте. |
| result.code | string | Уникальный идентификатор отчёта. |
| result.created_at | string | Дата создания отчёта. |
| result.error | string | Код ошибки при генерации отчёта. |
| result.expires_at | string | Дата и время, до которых отчёт доступен по ссылке.   Поле вернётся пустым, если отчёт сформирован до 14 октября 2025. |
| result.file | string | Ссылка на XLSX-файл.  Для отчёта с типом `SELLER_RETURNS` ссылка доступна 5 минут после выполнения запроса. |
| result.params | object | Массив с фильтрами, указанными при создании отчёта продавцом. |
| result.report_type | string | Тип отчёта:   - `SELLER_PRODUCTS` — отчёт по товарам;   - `SELLER_STOCK` — отчёт об остатках товаров;   - `SELLER_RETURNS` — отчёт о возвратах;   - `SELLER_POST |
| result.status | string | Статус генерации отчёта:   - `waiting` — в очереди на обработку,   - `processing` — обрабатывается,   - `success` — отчёт успешно создан,   - `failed` — ошибка |

---

## 34. POST /v1/report/list

**Статус:** Актуальный.

### Блок аналитики
Отчёты

### Назначение
Получить список ранее созданных отчётов.

### Что закрывает в аналитике
reports, report_type, status, file, created_at

### Когда вызывается
для страницы истории выгрузок и повторного получения отчёта

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `reportReportListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| page | integer | Да | Номер страницы. | Не указано |
| page_size | integer | Да | Количество значений на странице:   - по умолчанию — 100,   - маĸсимальное значение — 1000. | Не указано |
| report_type | ReportListRequestReportType | Нет | Тип отчёта:   - `ALL` — все отчёты;   - `SELLER_PRODUCTS` — отчёт по товарам;   - `SELLER_STOCK` — отчёт об остатках товаров;   - `SELLER_RETURNS` — отчёт о возвратах;   - `SELLER_POSTINGS` — отчёт об отправлениях;   - `SELLER_DISCOUNTED` — отчёт об… | ALL |

```json
{
  "page": 1,
  "page_size": 100,
  "report_type": "ALL"
}
```

### Response
Response schema: `reportReportListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | ReportListResponseResult | Результаты запроса. |
| result.reports | array<reportReport> | Массив со всеми сгенерированными отчётами. |
| result.total | integer | Суммарное количество отчётов. |

---

## 35. POST /v2/analytics/stock_on_warehouses

**Статус:** Актуальный.

### Блок аналитики
Аналитика

### Назначение
Получить отчёт по остаткам и товарам на складах.

### Что закрывает в аналитике
stock rows, warehouse_type, SKU/offer данные Нужно уточнить по response schema

### Когда вызывается
для страницы остатков и складской аналитики

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `analyticsStockOnWarehouseRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| limit | integer | Да | Количество ответов на странице. По умолчанию — 100. | Не указано |
| offset | integer | Нет | Количество элементов, которое будет пропущено в ответе. Например, если `offset = 10`, то ответ начнётся с 11-го найденного элемента. | Не указано |
| warehouse_type | AnalyticsGetStockOnWarehousesRequestWarehouseType | Нет | Фильтр по типу склада:   - `EXPRESS_DARK_STORE` — склады Ozon с доставкой Fresh.   - `NOT_EXPRESS_DARK_STORE` — склады Ozon без доставки Fresh.   - `ALL` — все склады Ozon. | ALL |

```json
{
  "limit": 1000,
  "offset": 0,
  "warehouse_type": "ALL"
}
```

### Response
Response schema: `analyticsStockOnWarehouseResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | analyticsStockOnWarehouseResponseResult | Результат запроса. |
| result.rows | array<analyticsStockOnWarehouseResultRows> | Информация о товарах и остатках. |

---

## 36. POST /v1/analytics/turnover/stocks

**Статус:** Актуальный.

### Блок аналитики
Аналитика

### Назначение
Получить оборачиваемость товара.

### Что закрывает в аналитике
sku, offer_id, current_stock, ads, idc, turnover, turnover_grade

### Когда вызывается
для расчёта оборачиваемости и статусов low/surplus/no_sales

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1AnalyticsTurnoverStocksRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| limit | integer | Нет | Количество значений в ответе. | Не указано |
| offset | integer | Нет | Количество элементов, которое будет пропущено в ответе.  Например, если `offset = 10`, ответ начнётся с 11-го найденного элемента. | Не указано |
| sku | array<string> | Нет | Идентификаторы товаров в системе Ozon — SKU. | Не указано |

```json
{
  "sku": [
    "123456789"
  ],
  "limit": 100,
  "offset": 0
}
```

### Response
Response schema: `v1AnalyticsTurnoverStocksResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| items | array<v1AnalyticsTurnoverStocksResponseItem> | Товары. |
| items[].ads | number | Среднесуточное количество проданных единиц товара за последние 60 дней. |
| items[].current_stock | integer | Остаток товара, шт. |
| items[].idc | number | На сколько дней хватит остатка товара с учётом среднесуточных продаж. |
| items[].idc_grade | string | Уровень остатка товара: - `GRADES_NONE` — ожидаются поставки; - `GRADES_NOSALES` — нет продаж; - `GRADES_GREEN` — зелёный, «хороший»; - `GRADES_YELLOW` — жёлтый |
| items[].name | string | Название товара. |
| items[].offer_id | string | Идентификатор товара в системе продавца — артикул. |
| items[].sku | integer | Идентификатор товара в системе Ozon — SKU. |
| items[].turnover | number | Фактическая оборачиваемость в днях. |
| items[].turnover_grade | string | Уровень оборачиваемости: - `GRADES_NONE` — ожидаются поставки; - `GRADES_NOSALES` — нет продаж; - `GRADES_GREEN` — зелёный, «хороший»; - `GRADES_YELLOW` — жёлты |

---

## 37. POST /v1/analytics/stocks

**Статус:** Актуальный.

### Блок аналитики
Аналитика

### Назначение
Получить аналитику по остаткам.

### Что закрывает в аналитике
sku, offer_id, available_stock_count, days_without_sales, idc, turnover_grade, warehouse_id

### Когда вызывается
для карточек товара, складской аналитики, товаров без продаж/избыточных товаров

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1AnalyticsStocksRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| cluster_ids | array<string> | Нет | Фильтр по идентификаторам кластеров. Получить идентификаторы можно через метод [/v1/cluster/list](#operation/SupplyDraftAPI_DraftClusterList). | Не указано |
| item_tags | array<string> | Нет | Фильтр по тегам товара:       - `ITEM_ATTRIBUTE_NONE` — без тега; - `ECONOM` — эконом-товар; - `NOVEL` — новинка; - `DISCOUNT` — уценённый товар; - `FBS_RETURN` — товар из возврата FBS; - `SUPER` — Super-товар. | Не указано |
| macrolocal_cluster_ids | array<string> | Нет | Фильтр по идентификаторам макролокальных кластеров. Получить идентификаторы можно в параметре `macrolocal_cluster_ids` метода [/v1/cluster/list](#operation/SupplyDraftAPI_DraftClusterList) или через метод [/v2/cluster/list](#operation/DraftClusterLi… | Не указано |
| skus | array<string> | Да | Фильтр по идентификаторам товаров в системе Ozon — SKU. | Не указано |
| turnover_grades | array<string> | Нет | Фильтр по статусу ликвидности товаров:       - `TURNOVER_GRADE_NONE` — нет статуса ликвидности.       - `DEFICIT` — дефицитный. Остатков товара хватит до 28 дней. - `POPULAR` — очень популярный. Остатков товара хватит на 28–56 дней. - `ACTUAL` — поп… | Не указано |
| warehouse_ids | array<string> | Нет | Фильтр по идентификаторам складов. Получить идентификаторы можно через метод [/v1/warehouse/list](#operation/WarehouseAPI_WarehouseList). | Не указано |

```json
{
  "skus": [
    "123456789"
  ]
}
```

### Response
Response schema: `v1AnalyticsStocksResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| items | array<v1AnalyticsStocksResponseItem> | Информация о товарах. |
| items[].ads | number | Среднесуточное количество проданных единиц товара за последние 28 дней по всем кластерам. |
| items[].ads_cluster | number | Среднесуточное количество проданных единиц товара за последние 28 дней в кластере. |
| items[].available_stock_count | integer | Количество товаров, которые доступны к продаже. Соответствует столбцу «Доступно к продаже». |
| items[].cluster_id | integer | Идентификатор кластера. Получить подробную информацию о кластере можно через метод [/v1/cluster/list](#operation/SupplyDraftAPI_DraftClusterList). |
| items[].cluster_name | string | Название кластера. |
| items[].days_without_sales | integer | Количество дней без продаж по всем кластерам. |
| items[].days_without_sales_cluster | integer | Количество дней без продаж в кластере. |
| items[].excess_stock_count | integer | Количество излишков с поставки, которые доступны к вывозу. |
| items[].expiring_stock_count | integer | Количество единиц товара с истекающим сроком годности. |
| items[].idc | number | Количество дней, на которое хватит остатка товара с учётом среднесуточных продаж за 28 дней по всем кластерам. |
| items[].idc_cluster | number | Количество дней, на которое хватит остатка товара с учётом среднесуточных продаж за 28 дней в кластере. |

---

## 38. GET /v1/actions

**Статус:** Актуальный.

### Блок аналитики
Продвижение / акции Seller API

### Назначение
Получить список доступных акций Ozon.

### Что закрывает в аналитике
action_id, title, action_type, dates, participating_products_count

### Когда вызывается
для учета участия товаров в акциях; это не Performance-реклама

### Auth
Нужно уточнить в конкретном method `parameters`: headers не указаны в операции. Глобальное описание Seller API указывает `Client-Id`, `Api-Key`, `Content-Type: application/json`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Нужно уточнить | Нужно уточнить | Нужно уточнить | В operation parameters headers не указаны. Глобальное описание Seller API указывает Client-Id, Api-Key и Content-Type для JSON-запросов. | Не указано |

### Request body
Нет

```json
{}
```

### Response
Response schema: `seller_apiGetSellerActionsV1Response`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | array<GetSellerActionsV1ResponseAction> | Результаты запроса. |
| result[].id | number | Идентификатор акции. |
| result[].title | string | Название акции. |
| result[].action_type | string | Тип акции. |
| result[].description | string | Описание акции. |
| result[].date_start | string | Дата начала акции. |
| result[].date_end | string | Дата окончания акции. |
| result[].auto_add_dates | array<string> | Дата и время автодобавления товаров в акцию. |
| result[].freeze_date | string | Дата приостановки акции.  Если поле заполнено, продавец не может повышать цены, изменять список товаров и уменьшать количество единиц товаров в акции.  Продавец |
| result[].potential_products_count | number | Количество товаров, доступных для акции. |
| result[].participating_products_count | number | Количество товаров, которые участвуют в акции. |
| result[].is_participating | boolean | Участвуете вы в этой акции или нет. |

---

## 39. POST /v1/actions/products

**Статус:** Актуальный.

### Блок аналитики
Продвижение / акции Seller API

### Назначение
Получить товары, участвующие в акции Ozon.

### Что закрывает в аналитике
action_id, products, sku/offer_id Нужно уточнить по response schema

### Когда вызывается
для понимания скидок/акций по товарам

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `seller_apiGetSellerProductV1Request`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| action_id | number | Да | Идентификатор акции. Можно получить с помощью метода [/v1/actions](#operation/Promos). | Не указано |
| limit | number | Нет | Количество ответов на странице. По умолчанию — 100. | Не указано |
| last_id | number | Нет | Идентификатор последнего значения на странице. При первом запросе оставьте это поле пустым. | Не указано |

```json
{
  "action_id": 12345,
  "limit": 100,
  "last_id": 0
}
```

### Response
Response schema: `seller_apiGetSellerProductV1Response`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| result | seller_apiGetSellerProductV1ResponseResult | Результаты запроса. |
| result.products | array<seller_apiProduct> | Список товаров. |
| result.total | number | Общее количество товаров, которое доступно для акции. |
| result.last_id | number | Идентификатор последнего значения на странице. Чтобы получить следующие значения, передайте полученное значение в следующем запросе в параметре `last_id`. |

---

## 40. POST /v1/seller-actions/list

**Статус:** Актуальный.

### Блок аналитики
Продвижение / акции Seller API

### Назначение
Получить список акций продавца.

### Что закрывает в аналитике
action_id, action_type, status, sku_count, is_turn_on

### Когда вызывается
для отображения акций продавца и анализа влияния скидок

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1SellerActionsListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| action_ids | array<string> | Нет | Идентификаторы акций. | Не указано |
| action_type | array<SellerActionsListRequestActionTypeEnum> | Нет | Механика акции:   - `DISCOUNT` — скидка;   - `VOUCHER_DISCOUNT` — скидка по промокоду;   - `DISCOUNT_WITH_CONDITION` — скидка от суммы заказа;   - `INSTALLMENT` — беспроцентная рассрочка;   - `INDIVIDUAL_DISCOUNT_BY_PRODUCTS` — бонусы продавца;   - … | Не указано |
| limit | integer | Да | Количество значений на странице. | Не указано |
| offset | integer | Нет | Количество элементов, которое будет пропущено в ответе. Например, если `offset = 10`, то ответ начнётся с 11-го найденного элемента. | Не указано |
| search | string | Нет | Поиск по названию акции. | Не указано |
| status | array<SellerActionsListRequestStatusEnum> | Нет | Статус акции:  - `ACTIVE` — активна;  - `ENDED` — завершена;  - `PLANNED` — запланирована;  - `PAUSED` — приостановлена. | Не указано |

```json
{
  "limit": 100,
  "offset": 0
}
```

### Response
Response schema: `v1SellerActionsListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| actions | array<SellerActionsListResponseAction> | Список акций. |
| actions[].action_id | integer | Идентификатор акции. |
| actions[].action_parameters | ActionParameter | Параметры акции. |
| actions[].allow_delete | boolean | `true`, если акцию можно удалить. |
| actions[].highlight_url | string | Ссылка на хайлайт. |
| actions[].is_editable | boolean | `true`, если акцию можно редактировать. |
| actions[].is_participated | boolean | `true`, если в акцию был добавлен хотя бы 1 товар. |
| actions[].is_turn_on | boolean | `true`, если акция включена. |
| actions[].sku_count | integer | Общее количество товаров в акции. |
| total | integer | Общее количество акций. |

---

## 41. POST /v1/seller-actions/products/list

**Статус:** Актуальный.

### Блок аналитики
Продвижение / акции Seller API

### Назначение
Получить товары, участвующие в акции продавца.

### Что закрывает в аналитике
action_price, base_price, discount_percent, price, product_id, offer_id, sku

### Когда вызывается
для анализа цены товара с учетом акции

### Auth
API-key headers указаны в swagger parameters для метода. OAuth глобально описан, но не привязан через `securitySchemes`.

### Path params
Нет

### Query params
Нет

### Headers
| Header | Тип | Обязательный | Описание | Пример |
| --- | --- | --- | --- | --- |
| Client-Id | string | Да | Идентификатор клиента. | Не указано |
| Api-Key | string | Да | API-ключ. | Не указано |
| Content-Type | string | Да | Тип содержимого запроса. Для JSON body используйте application/json. | application/json |

### Request body
Request schema: `v1SellerActionsProductsListRequest`

| Поле | Тип | Обязательное | Описание | Пример |
| --- | --- | --- | --- | --- |
| action_id | integer | Да | Идентификатор акции. Получите значение параметра методом [/v1/seller-actions/list](#operation/SellerActionsList). | Не указано |
| cursor | integer | Нет | Указатель для выборки следующих данных. | Не указано |
| limit | integer | Да | Максимальное количество элементов в ответе. | 100 |

```json
{
  "action_id": 12345,
  "limit": 100,
  "cursor": 0
}
```

### Response
Response schema: `v1SellerActionsProductsListResponse`

Ключевые поля response из schema:
| Поле | Тип | Описание |
| --- | --- | --- |
| cursor | integer | Указатель для выборки следующих данных. |
| has_next | boolean | Признак, что в ответе вернулась только часть значений: - `true` — сделайте повторный запрос с новым параметром `cursor` для получения остальных значений; - `fal |
| products | array<v1SellerActionsProductsListResponseProduct> | Информация о товарах. |
| products[].action_price | number | Цена товара с учётом акции. |
| products[].base_price | number | Базовая цена, по которой товар продаётся на Ozon, если не участвует в акции. |
| products[].currency | string | Валюта. |
| products[].discount_percent | number | Процент скидки. |
| products[].is_active | boolean | `true`, если товар участвует в акции. |
| products[].min_seller_price | number | Минимальная цена для автоматического добавления товара в акцию. |
| products[].name | string | Название товара. |
| products[].offer_id | string | Идентификатор товара в системе продавца — артикул. |
| products[].price | number | Цена товара для покупателя. |

---

## Данные, которых нет в Seller API swagger и которые нужно хранить внутри приложения

- себестоимость товара
- доставка из Китая
- упаковка
- зарплаты
- налоговые настройки
- накладные расходы
- самовыкупы, если нет явного метода в swagger
- баллы для снижения налоговой базы
- ручные корректировки

## Реклама

В `paths` этого swagger не найдено методов Ozon Performance API / advertising / campaigns. Для рекламных расходов нужен отдельный swagger/documentation Ozon Performance API. В Seller API есть только акции и акции продавца: `/v1/actions`, `/v1/actions/products`, `/v1/seller-actions/list`, `/v1/seller-actions/products/list`.