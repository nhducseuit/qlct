--
-- PostgreSQL database dump
--

-- Dumped from database version 15.13 (Debian 15.13-1.pgdg120+1)
-- Dumped by pg_dump version 15.13 (Debian 15.13-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    "parentId" text,
    icon text,
    color text,
    "isPinned" boolean DEFAULT false NOT NULL,
    "order" integer,
    "isHidden" boolean DEFAULT false NOT NULL,
    "budgetLimit" double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "defaultSplitRatio" jsonb,
    "userId" text NOT NULL
);


ALTER TABLE public."Category" OWNER TO youruser;

--
-- Name: HouseholdMember; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public."HouseholdMember" (
    id text NOT NULL,
    name text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "order" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."HouseholdMember" OWNER TO youruser;

--
-- Name: PredefinedSplitRatio; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public."PredefinedSplitRatio" (
    id text NOT NULL,
    name text NOT NULL,
    "splitRatio" jsonb NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PredefinedSplitRatio" OWNER TO youruser;

--
-- Name: Settlement; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public."Settlement" (
    id text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) with time zone NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "payerId" text NOT NULL,
    "payeeId" text NOT NULL,
    "userId" text NOT NULL
);


ALTER TABLE public."Settlement" OWNER TO youruser;

--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    amount double precision NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    note text,
    type text NOT NULL,
    payer text,
    "isShared" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "splitRatio" jsonb,
    "userId" text NOT NULL,
    "categoryId" text NOT NULL
);


ALTER TABLE public."Transaction" OWNER TO youruser;

--
-- Name: User; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO youruser;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO youruser;

--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."Category" (id, name, "parentId", icon, color, "isPinned", "order", "isHidden", "budgetLimit", "createdAt", "updatedAt", "defaultSplitRatio", "userId") FROM stdin;
1ace540a-7630-41bd-a320-c4b70c0c2e40	Điện	522ed51f-2bc4-4503-951d-c42d5b1f50e8		\N	f	4	f	\N	2025-06-14 13:42:25.27	2025-06-14 13:42:25.27	null	dev-user
522ed51f-2bc4-4503-951d-c42d5b1f50e8	Chi tiêu thiết yếu	\N		#424242	f	5	f	\N	2025-06-14 13:38:59.45	2025-06-14 13:38:59.45	null	dev-user
87ae0b88-d46d-42fe-965c-6813268e44d1	Đầu tư tài sản	\N		\N	f	3	f	\N	2025-06-09 16:11:59.435	2025-06-14 13:45:09.991	[]	dev-user
1e080f30-11ac-42b2-9793-d6df219a18cf	Khác	\N		\N	f	5	f	\N	2025-06-09 16:13:29.191	2025-06-14 13:45:11.269	[]	dev-user
76528a8a-a82a-4ef0-87aa-256ac621b43b	Khám chữa bệnh	522ed51f-2bc4-4503-951d-c42d5b1f50e8		\N	t	2	f	\N	2025-06-14 13:40:57.075	2025-06-14 13:45:31.289	[]	dev-user
f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857	Thiết yếu khác	522ed51f-2bc4-4503-951d-c42d5b1f50e8		\N	t	7	f	\N	2025-06-14 13:44:14.267	2025-06-14 13:45:35.06	[]	dev-user
5ae9865d-4041-4612-a757-8730161071c7	Thời trang	\N		\N	f	4	f	\N	2025-06-09 16:13:06.301	2025-06-14 13:46:06.19	[]	dev-user
182fe1c6-5b87-4468-93ba-159e01146b3d	Báo hiếu	\N		\N	t	2	f	2500000	2025-06-09 16:11:36.571	2025-06-14 16:57:52.717	null	dev-user
37d6ca79-243b-4ed4-9d77-8675215393c6	Ăn uống	522ed51f-2bc4-4503-951d-c42d5b1f50e8		\N	t	0	f	5000000	2025-06-14 13:39:31.814	2025-06-18 16:50:50.181	null	dev-user
99c48cd0-82d4-4c0e-8edd-6e84688360e1	Hiếu hỉ ma chay	522ed51f-2bc4-4503-951d-c42d5b1f50e8		\N	f	3	f	500000	2025-06-14 13:41:08.797	2025-06-18 16:51:17.925	null	dev-user
714920cc-22c9-4e14-a8cd-88d488ffeb58	Đi lại	522ed51f-2bc4-4503-951d-c42d5b1f50e8		\N	t	5	f	1000000	2025-06-14 13:42:37.376	2025-06-18 16:52:03.792	null	dev-user
f35b2279-c7d3-4ff6-b867-b79955b5227e	Giáo dục	522ed51f-2bc4-4503-951d-c42d5b1f50e8		\N	f	6	f	500000	2025-06-14 13:43:50.928	2025-06-18 16:52:13.89	null	dev-user
270c1489-c0a3-457d-b778-59e222880073	Giải trí	\N		\N	t	1	f	500000	2025-06-09 16:11:19.045	2025-06-18 16:52:28.037	null	dev-user
5d271e51-1c6b-4919-b76e-d7a59e719b22	Cho đi	\N		\N	t	6	f	250000	2025-06-14 13:44:56.828	2025-06-18 16:52:44.071	null	dev-user
3c12efe1-5994-449d-80e0-d6ba2b0dfdf5	Nhà	522ed51f-2bc4-4503-951d-c42d5b1f50e8		\N	f	1	f	1000000	2025-06-14 13:40:24.504	2025-06-20 16:10:04.38	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 33}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 34}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 33}]	dev-user
\.


--
-- Data for Name: HouseholdMember; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."HouseholdMember" (id, name, "isActive", "order", "createdAt", "updatedAt", "userId") FROM stdin;
70aa6c9a-0840-4de7-bb5a-8400ec3808af	Cháu Phong	f	\N	2025-06-10 17:03:34.397	2025-06-10 17:11:32.016	dev-user
9d61b79a-7351-44e4-9ea5-f32304ae1bca	Chị Thương	f	\N	2025-06-10 17:03:23.316	2025-06-10 17:11:33.671	dev-user
94e6e8bf-3a8a-4234-a07c-28c54c1a06e6	O Thảo	t	4	2025-06-09 14:53:02.572	2025-06-14 13:36:54.72	dev-user
577ee6f9-283e-46c7-bbb3-9910bc70e2d5	Vợ	t	2	2025-06-09 14:52:36.656	2025-06-15 03:45:24.52	dev-user
16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	Bác Anh	t	3	2025-06-09 14:52:56.651	2025-06-15 03:45:37.156	dev-user
910b287d-d365-4daa-83d5-11c096b07068	Chồng	t	1	2025-06-09 14:52:44.98	2025-06-15 03:45:37.2	dev-user
\.


--
-- Data for Name: PredefinedSplitRatio; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."PredefinedSplitRatio" (id, name, "splitRatio", "userId", "createdAt", "updatedAt") FROM stdin;
b3396d63-7620-40fa-999a-5a6323069d24	Đức Điệp (2vc)	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	42193bed-a5c8-424f-9ba0-6732e48361a1	2025-06-10 16:44:48.782	2025-06-23 13:05:55.482
2a1b71b6-7f26-4bfa-b7b2-9fecccee9030	Nhà chung (4 người)	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	42193bed-a5c8-424f-9ba0-6732e48361a1	2025-06-10 16:44:48.799	2025-06-23 13:05:55.488
\.


--
-- Data for Name: Settlement; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."Settlement" (id, amount, date, note, "createdAt", "updatedAt", "payerId", "payeeId", "userId") FROM stdin;
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."Transaction" (id, amount, date, note, type, payer, "isShared", "createdAt", "updatedAt", "splitRatio", "userId", "categoryId") FROM stdin;
9cd16161-4f1f-453b-9df2-62ace815e04d	144000	2025-06-13 17:00:00	Mỳ cay xuyên bờm	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-14 13:48:25.557	2025-06-14 13:48:25.557	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
b6fe5e3f-35d7-4152-8d3e-e503914009ba	70000	2025-06-13 17:00:00	Đi chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-14 13:50:04.897	2025-06-14 13:50:04.897	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
6a4dc31e-36fb-4843-a348-200f43b11c74	25000	2025-06-13 17:00:00	Nước dừa	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-14 13:50:18.579	2025-06-14 13:50:18.579	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
cb5264fa-1ea1-49c3-bd50-dd2b7759853b	75000	2025-06-12 17:00:00	Chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-14 13:52:26.253	2025-06-14 13:52:26.253	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
72cad682-5fbc-4cb3-89f7-05e3a33d41aa	45000	2025-06-15 00:00:00	Dừa x2 quả	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 03:28:23.31	2025-06-15 03:28:23.31	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
8c93defd-5bbc-4487-942c-568915f050c8	55000	2025-06-13 00:00:00	Chồng ăn uống	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 03:45:10.581	2025-06-15 03:45:10.581	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
bea25023-49f2-40bc-86aa-62255f3574bd	60000	2025-06-01 17:00:00	Cắt tóc	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-14 14:05:43.199	2025-06-14 14:05:43.199	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
3e4f9bc3-3522-404a-bb8b-063c2adc575b	3000000	2025-06-01 17:00:00	nhà t6	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-14 13:53:54.89	2025-06-14 13:53:54.89	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 33}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 34}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 33}]	dev-user	3c12efe1-5994-449d-80e0-d6ba2b0dfdf5
a762cb74-29a4-431f-82be-21de7e216833	170000	2025-06-15 00:00:00	Khám thai	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 12:28:12.73	2025-06-15 12:28:12.73	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
b9345f26-6653-4f18-b154-84034c2e7d64	26700000	2025-06-06 00:00:00		income	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 03:31:42.261	2025-06-18 16:48:56.804	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	1e080f30-11ac-42b2-9793-d6df219a18cf
1fee04e8-224e-4b79-bb88-0c2d00e6274c	240000	2024-05-01 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:04:01.536	2025-06-15 16:04:47.958	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
091a842f-51a4-483c-ae78-d51327126d16	400000	2025-05-01 00:00:00	Tôm 30/4	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:37:28.646	2025-06-15 16:37:28.646	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
f8c15559-4ef5-4c47-b950-74c820998028	200000	2025-05-01 00:00:00	Tôm 30/4	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:37:50.816	2025-06-15 16:37:50.816	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9b0bd717-c1d7-4e00-bb43-c727ca588955	2000000	2025-05-01 00:00:00	Cho bà ngoại	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:39:47.658	2025-06-15 16:39:47.658	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	182fe1c6-5b87-4468-93ba-159e01146b3d
e0c9b11f-273e-45ed-9bc7-83c0a92c97fc	140000	2025-05-01 00:00:00	Viếng anh rể	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:40:19.396	2025-06-15 16:40:19.396	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	99c48cd0-82d4-4c0e-8edd-6e84688360e1
ab6699b3-4a39-443a-bd98-142fa43c4a09	120000	2025-05-01 00:00:00	Chợ sen	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:41:06.621	2025-06-15 16:41:06.621	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9b0a4923-452c-47b8-9867-418c4c3750da	30000	2025-05-01 00:00:00	Đổ xăng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:41:27.245	2025-06-15 16:41:27.245	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
319a5032-4144-43bd-9b44-5b1da60ceac3	130000	2025-05-02 00:00:00	Vợ đi xe ghép	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:42:00.502	2025-06-15 16:42:00.502	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
cf6090cd-6e8e-4659-be95-0e6df06961c1	120000	2025-05-02 00:00:00	Chồng đi xe ghép	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:42:15.585	2025-06-15 16:42:15.585	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
4802bcf2-9ed4-4baa-a28b-61dd2682de59	100000	2025-05-02 00:00:00	Vợ ăn	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:42:43.889	2025-06-15 16:42:43.889	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
a9363d09-f7b7-4033-86d3-d7fbcd7ffdbd	100000	2025-05-02 00:00:00	Chồng ăn	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:42:56.796	2025-06-15 16:42:56.796	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
e9ac5b3f-7aa3-4a44-9944-64347672b7c9	35000	2025-05-02 00:00:00	maxim	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:43:25.356	2025-06-15 16:43:25.356	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
78c1064e-61d2-4451-86b1-a37b5807f4f6	465000	2025-05-02 00:00:00	Tái khám dã liễu	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:43:44.479	2025-06-15 16:43:44.479	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
bc163168-0122-46ea-b7d0-bda59158a36b	347000	2025-05-02 00:00:00	Canxi hữu cơ nội	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:44:24.158	2025-06-15 16:44:24.158	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
020f7bfe-dca0-4e30-a16b-c12292b480e5	180000	2025-05-02 00:00:00	internet t5/2025	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:44:42.184	2025-06-15 16:44:42.184	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
6e2d3729-d32f-498a-8229-8793a70f51b0	70000	2025-05-03 00:00:00	Vợ ăn sáng	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:45:14.331	2025-06-15 16:45:14.331	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
5d6269af-6b19-4424-a409-44a6d41f1f51	25000	2025-05-03 00:00:00	Rửa xe	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:45:33.503	2025-06-15 16:45:33.503	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
83d0b95a-1c82-4f9e-98ff-6c1bf95d8c4b	1105000	2025-05-03 00:00:00	Vợ khám phụ khoa	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:45:51.937	2025-06-15 16:45:51.937	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
66a63a49-63dd-486b-945f-29b53d4ae31e	70000	2025-05-03 00:00:00	2vc ăn trưa	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:46:20.573	2025-06-15 16:46:20.573	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
970bcea1-2a29-431d-a51c-40493863dbb7	70000	2025-05-03 00:00:00	Winmart	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:46:48.759	2025-06-15 16:46:48.759	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
4edeaa59-f783-4caa-95e1-456fb6df4378	36000	2025-05-03 00:00:00	Tạp hoá	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:47:11.137	2025-06-15 16:47:11.137	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
2a7253b8-c541-43df-aed3-aefa80a24a3a	130000	2025-05-03 00:00:00	Gối ôm cho vợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:47:35.279	2025-06-15 16:47:35.279	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
4b185b7a-80f0-4486-9546-8999e9bc3bd4	185000	2025-05-03 00:00:00	Quần bầu áo lót bầu	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:48:07.575	2025-06-15 16:48:07.575	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
c2c8aef6-92fd-429a-b0e7-95ebd76b29e2	300000	2025-05-03 00:00:00	Quạt cây	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:48:31.48	2025-06-15 16:48:31.48	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
491984ed-9307-4f2b-b68c-77b4b0d6a129	473000	2025-05-03 00:00:00	Chợ kèo 30/4	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:49:23.715	2025-06-15 16:49:23.715	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
a73ad09d-59c5-4086-946a-71af545ed8b0	96000	2025-05-05 00:00:00	Vaseline	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:50:25.02	2025-06-15 16:50:25.02	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
6db1b916-8f87-48fb-b955-34298c300fd6	70000	2025-05-05 00:00:00	Vợ ăn vặt	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:50:40.672	2025-06-15 16:50:40.672	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
214298b4-9d4d-4543-b776-c08758c8000f	45000	2025-05-05 00:00:00	Chồng ăn	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:50:55.479	2025-06-15 16:50:55.479	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
740e7b62-0e99-4eec-a164-bd737832a454	69000	2025-05-06 00:00:00	Quần lót vợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:51:18.446	2025-06-15 16:51:18.446	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
dce7931b-cefe-4ad3-9a7b-0e2d06229786	88000	2025-05-06 00:00:00	Hoa quả và nước	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:51:37.847	2025-06-15 16:51:37.847	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
b451e2b3-cf24-488e-aa44-5ebcfdf26adb	158000	2025-05-06 00:00:00	Tạp hoá	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:51:54.373	2025-06-15 16:51:54.373	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
ed9db535-74ed-4597-bcc4-dfe97a30296a	50000	2025-05-06 00:00:00	Chồng đổ xăng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:52:09.849	2025-06-15 16:52:09.849	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
ab2ff610-9d44-43fb-bf79-21435eae87cc	50000	2025-05-06 00:00:00	Chồng ăn uống	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:52:35.508	2025-06-15 16:52:35.508	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
21f102b7-33db-4c46-8e85-6eec143f4ae7	790000	2025-05-06 00:00:00	Điện kỳ tháng 4	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-15 16:52:59.766	2025-06-15 16:52:59.766	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	1ace540a-7630-41bd-a320-c4b70c0c2e40
e46f999f-9f8f-4d26-8d21-a9a465e162cf	35000	2025-05-07 00:00:00	Vợ ăn sáng	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:53:19.497	2025-06-15 16:53:19.497	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
da3c6c4b-db38-459a-9778-0f80144eaf0c	55000	2025-05-07 00:00:00	Vợ đi chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-15 16:53:41.974	2025-06-15 16:53:41.974	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
83ef6913-79a2-41e9-b383-3d75bfcd116a	45000	2025-05-07 00:00:00	nc mía nc dừa vợ thèm	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:54:18.357	2025-06-15 16:54:18.357	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
09739437-5a60-4102-8e60-d738bd03b858	70000	2025-05-07 00:00:00	Đổ xăng	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:54:38.274	2025-06-15 16:54:38.274	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
31d5bdad-ca94-4e4a-959a-87164d7d04b8	40000	2025-05-07 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:54:55.612	2025-06-15 16:54:55.612	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
0327f88a-4efd-4bf2-8d45-c082f4bc561a	100000	2025-05-07 00:00:00	Thay nhớt hầy hầy	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:55:30.103	2025-06-15 16:55:30.103	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
901a4da6-1fbb-4bf3-8867-7acbdb0a4b45	50000	2025-05-08 00:00:00	Đổ xănh	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:55:53.463	2025-06-15 16:55:53.463	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
9d85e291-a4df-4796-b6aa-76c6742b5431	200000	2025-06-16 00:00:00	Khám balan	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:13:16.951	2025-06-16 16:13:16.951	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
0b72f4a9-88a8-4dfd-bb1c-a8f05f0a12ae	305000	2025-06-16 00:00:00	Khám balan	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:14:26.355	2025-06-16 16:14:26.355	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
57451788-a610-4c13-9428-d5e017427879	122000	2025-06-16 00:00:00	Taxi đi khám	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:14:53.693	2025-06-16 16:14:53.693	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
e5aaec49-fe1a-4148-9657-14a2ecac2d8b	280000	2025-05-09 00:00:00	Vợ khám	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:58:00.85	2025-06-16 16:16:21.357	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
cab3834f-8f48-48a8-9177-2fdc31beb9fd	60000	2025-05-09 00:00:00	Vợ đi lại taxi	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:58:38.166	2025-06-16 16:16:42.479	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
d3324920-f2cb-4e9c-a1e4-056289076991	70000	2025-05-09 00:00:00	Vợ ăn uống	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:59:01.027	2025-06-16 16:17:05.411	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
56f8fe02-93eb-4b47-be87-0492cd183feb	26000	2025-05-09 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-15 16:59:34.071	2025-06-16 16:17:12.604	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
eaf7c70f-52ec-45c8-8885-3cd18e6d882e	1661000	2025-06-16 00:00:00	khám balan	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:12:45.754	2025-06-18 16:44:12.504	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
cefefa71-a04c-4481-8256-a9f102cc3c1b	24000	2025-06-16 00:00:00	Chồng ăn	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:15:10.32	2025-06-16 16:15:10.32	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
501e1299-51d0-4c53-b9ca-fd1f78df0695	84000	2025-05-08 00:00:00	Vợ qn mỳ cay và …	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-15 16:56:50.925	2025-06-16 16:16:02.416	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
02e6dc34-58ef-40f8-86c7-479132472a3c	25000	2025-05-10 00:00:00	Đổ xăng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:17:41.321	2025-06-16 16:17:41.321	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
d2a48148-2d18-4591-9c9f-98a25175020a	178000	2025-05-10 00:00:00	Xem phim 2vc	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:18:06.641	2025-06-16 16:18:06.641	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	270c1489-c0a3-457d-b778-59e222880073
413bf421-2843-4cd0-a0ef-e0e1a5973cfd	164000	2025-05-10 00:00:00	Đi sthi	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:18:39.599	2025-06-16 16:18:39.599	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
f0819b44-5942-4ddb-90ff-be9946b89eb6	15000	2025-05-10 00:00:00		expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:18:55.589	2025-06-16 16:18:55.589	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
2a94d575-1d49-46bb-bcdc-0e28bd46db80	128000	2025-05-11 00:00:00	Chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:19:21.456	2025-06-16 16:19:21.456	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
dc77625d-e853-4363-bcb6-4bb8d857827d	109000	2025-05-11 00:00:00	Quần bầu	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:19:59.078	2025-06-16 16:19:59.078	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
0bd45181-b4f8-4d59-93bf-c011c5a2a20f	35000	2025-05-11 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:20:18.614	2025-06-16 16:20:18.614	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
3f1aacb2-fe50-4975-8115-06c0ebd432e3	95000	2025-05-12 00:00:00	Nước tháng 4	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:20:55.353	2025-06-16 16:20:55.353	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
e2e8c740-7fad-4e19-9170-5814da25af13	55000	2025-05-12 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:21:22.799	2025-06-16 16:21:22.799	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
0870cbc1-c732-4a3c-b9e6-c4711c6af058	20000	2025-05-12 00:00:00	Dưa bở	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:21:45.117	2025-06-16 16:21:45.117	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
da0b5416-1aad-4105-a449-11299811121b	140000	2025-05-12 00:00:00	Chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:22:16.438	2025-06-16 16:22:16.438	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
c96a48b2-c722-4bd5-baf3-32ab39910354	70000	2025-05-12 00:00:00		expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:23:21.579	2025-06-16 16:23:21.579	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
65dc5790-04f8-42ef-8fcd-61caacc5fac3	200000	2025-05-12 00:00:00	Dép	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:23:44.687	2025-06-16 16:23:44.687	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
5b0d01aa-a78d-44f7-a6d0-b4354c7a9129	80000	2025-05-12 00:00:00		expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:24:03.017	2025-06-16 16:24:03.017	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
29c784e4-90dc-41f2-9ae4-cefa4255664b	320000	2025-05-12 00:00:00	Quần áo bầu	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:24:28.457	2025-06-16 16:24:28.457	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
e3d77844-c626-427d-a65f-28b020497384	154000	2025-05-13 00:00:00	Chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:24:51.257	2025-06-16 16:24:51.257	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
376967e0-6f0a-43d0-94f0-f9b601c47ff0	40000	2025-05-13 00:00:00	Ăn sáng	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:25:13.524	2025-06-16 16:25:13.524	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
47b211ee-75e9-4a5f-a3e0-6d55e40a22ca	55000	2025-05-13 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:25:23.481	2025-06-16 16:25:23.481	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
62242af7-a3a9-4787-8e7a-f962633b87f8	500000	2025-05-14 00:00:00	Ủng hộ 60 năm thành lập trường c3 tk1	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:28:33.105	2025-06-16 16:29:17.703	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	5d271e51-1c6b-4919-b76e-d7a59e719b22
c204d41d-e1d2-429c-9854-e47da18bedda	150000	2025-05-14 00:00:00	Gội đầu	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:26:10.519	2025-06-16 16:29:28.034	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
6c03b0e3-32c2-438f-a766-6899ce4669d3	136000	2025-05-14 00:00:00	Đi chợ + bigc	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:27:06.763	2025-06-16 16:29:41.204	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
4beceee2-8f2c-4924-9d08-ac87be9322a7	55000	2025-05-14 00:00:00	Khâu dép sửa quần áo	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:26:31.128	2025-06-16 16:29:49.314	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
96ac5b7c-bfa3-4ad5-b938-09964adf2f91	75000	2025-05-14 00:00:00	Ăn sáng	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:27:50.354	2025-06-16 16:30:10.658	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
6e243e62-c25a-4993-a927-b0aaf18c5b58	15000	2025-05-15 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:31:06.983	2025-06-16 16:31:06.983	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
6b065de2-c7f5-4da5-a4e9-65bb74cb8753	50000	2025-05-15 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:31:18.802	2025-06-16 16:31:18.802	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
b3dc7f18-5f82-4ba4-933c-ff864d506d5e	36000	2025-05-15 00:00:00		expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:31:35.983	2025-06-16 16:31:35.983	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
10866ebe-369c-4147-b698-46468716f6a7	6000000	2025-05-15 00:00:00	Lắp điều hoà ở nhà	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:36:58.705	2025-06-16 16:36:58.705	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
48d06d1d-d63e-4a35-b48f-f4b6888f73e8	200000	2025-05-16 00:00:00	Viếng bác Hồng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:32:13.703	2025-06-16 16:37:59.493	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	99c48cd0-82d4-4c0e-8edd-6e84688360e1
6fc14ed8-0188-446f-98d2-c9de68c7092c	35000	2025-05-16 00:00:00	Bọc nhôm	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:32:39.608	2025-06-16 16:38:10.142	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
c5ffc1ea-042b-46ff-bca8-46ac44b66992	190000	2025-05-16 00:00:00	Mời cf đội IMS	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:33:24.996	2025-06-16 16:38:18.521	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	5d271e51-1c6b-4919-b76e-d7a59e719b22
3ba216ad-c15f-4ca5-86f4-fd2d20c097fd	169000	2025-05-16 00:00:00	Hạt óc chó, hạt bù	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:34:14.916	2025-06-16 16:38:29.639	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
4c1485b5-727d-441c-a646-d0fe282450d1	118000	2025-05-16 00:00:00	Chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:34:35.394	2025-06-16 16:38:38.013	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
13d02929-aa96-4b84-8a04-44ff58a3f028	19000	2025-05-17 00:00:00	Icloud	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:35:03.784	2025-06-16 16:38:47.419	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
bce20125-da8c-479a-80a6-7fc68623efed	120000	2025-05-17 00:00:00	Tiền xe cho vợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:35:31.683	2025-06-16 16:39:01.915	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
54ee955d-25e0-4f82-87c3-3e84b0dea725	100000	2025-05-17 00:00:00	Thăm con anh Nhân	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:36:03.437	2025-06-16 16:39:17.301	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	5d271e51-1c6b-4919-b76e-d7a59e719b22
3be5898a-4733-4b39-b298-323afdefb450	99000	2025-05-18 00:00:00	Đưa cháu đi ăn lotte	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:40:24.959	2025-06-16 16:41:44.204	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
a45d0866-eb53-43cf-a9b1-c48bb435c754	70000	2025-05-18 00:00:00	Đổ xăng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:40:39.472	2025-06-16 16:41:52.1	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
a02c8889-cd0b-43a3-ad2a-eef2cd8a4905	120000	2025-05-19 00:00:00	Đấm bóp người mù	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:41:21.841	2025-06-16 16:41:21.841	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
c570bd3d-9b20-4f3f-9580-df26a760ee8f	74000	2025-05-18 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:39:48.053	2025-06-16 16:41:37.886	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
50f30bdd-09fa-4668-a322-27c047f3d208	339000	2025-05-19 00:00:00	Bộ dụng cụ sửa chữa điện tử + mạch dk từ xa cho quạt x2	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:43:38.137	2025-06-16 16:43:38.137	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	1e080f30-11ac-42b2-9793-d6df219a18cf
2154459b-5009-424f-b571-845a5a617276	31000	2025-05-19 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:43:49.583	2025-06-16 16:43:49.583	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
879a4b1e-a2db-4338-af0e-c151074373ca	133000	2025-05-19 00:00:00	Hạt điều 1kg	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:44:08.868	2025-06-16 16:44:08.868	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
349bb1df-a7f4-4fa6-bc42-3ead0b00ed1c	85000	2025-05-19 00:00:00	Túi giặt x2	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:44:31.834	2025-06-16 16:44:31.834	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
0f5a8f8d-e7f9-46ef-8a2f-2f27002e7281	108000	2025-05-20 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:45:00.536	2025-06-16 16:45:00.536	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
3574a2a1-2458-4f10-b3a2-bad671b7b62a	49000	2025-05-20 00:00:00	Onedrive	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:45:22.593	2025-06-16 16:45:22.593	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
7824432b-e03a-4fe7-ad66-7030df664107	95000	2025-05-21 00:00:00	Ăn sáng 2vc và cháu	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:46:01.966	2025-06-16 16:46:01.966	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
eb28bf40-2c3e-48d0-ac62-c158b04a6178	26000	2025-05-21 00:00:00	Sữa	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:46:22.644	2025-06-16 16:46:22.644	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
790de54c-c943-4e7e-b577-d70d5cbfe649	280000	2025-05-21 00:00:00	Sắt	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:47:00.057	2025-06-16 16:47:00.057	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
dc85f1bc-e061-4360-ba2f-784b3720cfc0	53000	2025-05-21 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:47:14.198	2025-06-16 16:47:14.198	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
421e5bef-97a1-466c-ba86-c04ddf7e1562	120000	2025-05-21 00:00:00	Tiền xe vợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:47:47.84	2025-06-16 16:47:47.84	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
3d6d4d4a-2e84-4e1c-b837-dc85e1cef7a0	20000	2025-05-22 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:48:19.022	2025-06-16 16:48:19.022	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
94b07001-3af7-420a-89d6-95ab9af747d5	35000	2025-05-22 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:48:31.178	2025-06-16 16:48:31.178	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
f1732262-d824-4f79-a622-e5cf64dfc1b8	18000	2025-05-23 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:48:57.316	2025-06-16 16:48:57.316	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
8c411ed4-a7f5-4684-b95f-0063666ce59a	300000	2025-05-23 00:00:00	Mừng cưới em Trâm con dì Yến	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:49:25.23	2025-06-16 16:49:25.23	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	99c48cd0-82d4-4c0e-8edd-6e84688360e1
5fc2d71e-6c4c-4147-95e9-cd556e0523af	230000	2025-05-24 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:49:49.641	2025-06-16 16:49:49.641	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9a1b9b3c-b7a4-4077-a1be-50011bce1a60	20000	2025-05-24 00:00:00	Ăn sáng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:50:20.877	2025-06-16 16:50:20.877	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
42065bc7-e640-4dd0-9c13-1183e0a2ec39	65000	2025-05-24 00:00:00	Mời cf 2 em Tuấn Trọng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:50:54.615	2025-06-16 16:50:54.615	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	5d271e51-1c6b-4919-b76e-d7a59e719b22
5a4fc90f-9341-413f-a044-a1a1a4cc6241	20000	2025-05-24 00:00:00	Chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 16:51:15.572	2025-06-16 16:51:15.572	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
2a3b8ede-6a43-402c-baaf-2799ca025bab	19000	2025-05-24 00:00:00	Icloud	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:51:29.774	2025-06-16 16:51:29.774	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
a277491c-a783-4dbc-895b-d4733d994624	100000	2025-05-26 00:00:00	Vợ đi xe về ngoại	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:52:07.36	2025-06-16 16:52:07.36	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
e13eff7f-c0b2-406a-b12b-80f9a868182b	50000	2025-05-26 00:00:00	Bánh mì	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:52:32.675	2025-06-16 16:52:32.675	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	182fe1c6-5b87-4468-93ba-159e01146b3d
ee2246b0-7bc7-4548-be2c-6e98df872e34	550000	2025-05-26 00:00:00	Thuốc cho bố	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:53:03.176	2025-06-16 16:53:03.176	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	182fe1c6-5b87-4468-93ba-159e01146b3d
47b98700-3fe2-48c1-9cd0-e753269786d7	348000	2025-05-26 00:00:00	Đi hà nội	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:53:40.351	2025-06-16 16:53:40.351	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
06036549-3db1-4267-9384-1f5dff6569c3	190000	2025-05-26 00:00:00	Quà Tam Đảo	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:54:05.017	2025-06-16 16:54:05.017	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	5d271e51-1c6b-4919-b76e-d7a59e719b22
ee0d086b-76aa-4173-bb9a-b902a37c7877	31000	2025-05-26 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:54:18.802	2025-06-16 16:54:18.802	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
6dd8c2c8-050c-4c44-8686-a1f8d1ce52de	18000	2025-05-27 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:54:33.702	2025-06-16 16:54:33.702	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
cf33ffa4-9b28-446d-a8fe-f6c6111a1b64	67000	2025-05-28 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:54:47.954	2025-06-16 16:57:01.106	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
314371e6-74c3-4c72-9fa3-f9c501809ba3	20000	2025-05-29 00:00:00	Ăn sáng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:55:33.303	2025-06-16 16:57:15.348	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
666b7db7-9b6b-45c1-9350-a674da2f765d	120000	2025-05-29 00:00:00	Tiền xe	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 16:55:09.769	2025-06-16 16:57:26.382	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
646d79ea-1851-4a51-8c29-a6c518cd8c52	38000	2025-05-29 00:00:00	ăn trưa	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:55:51.807	2025-06-16 16:57:34.467	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
0b96c86f-8355-4db1-adf7-e65390297ed7	25000	2025-05-27 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 16:58:49.973	2025-06-16 16:58:49.973	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
ff320bbe-fd02-4f58-8e4d-1bf65c64daa0	200000	2025-05-27 00:00:00	Thăm sếp	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:58:17.63	2025-06-16 16:59:02.744	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	5d271e51-1c6b-4919-b76e-d7a59e719b22
a6114343-7d27-4758-8091-5f728ca5ae92	12000	2025-05-28 00:00:00	Bánh bao	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 16:59:24.151	2025-06-16 16:59:24.151	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9afdcff7-b62f-4642-8b7f-6a864dc63fb8	60000	2025-05-30 00:00:00	Ăn trưa	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-16 17:01:39.732	2025-06-16 17:01:39.732	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
0124236c-4ef5-4922-ab86-754582391f74	60000	2025-05-30 00:00:00	Ăn sáng	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 17:01:12.35	2025-06-16 17:01:52.424	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
88246744-c1b3-4e20-b924-4354a762d50c	462000	2025-05-31 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 17:02:51.665	2025-06-16 17:02:51.665	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
5c327885-6fdf-40a6-bd8d-07421b9d7dae	210000	2025-05-31 00:00:00	Tiêm phòng 2vc đợt 1	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 17:03:20.851	2025-06-16 17:03:20.851	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
8d39f7fd-fa6e-4899-be16-dee931a4fd0b	76000	2025-05-31 00:00:00	Đổ xăng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-16 17:03:48.497	2025-06-16 17:03:48.497	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
1c27248a-7d9a-4393-bc08-1ed1c1d7a96b	17000	2025-05-31 00:00:00	Tạp hoá	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-16 17:04:07.219	2025-06-16 17:04:07.219	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
02c71554-052d-4820-bc00-0011f3e2f20c	3000000	2025-05-14 00:00:00	Nhà t5	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-16 17:09:45.643	2025-06-16 17:09:45.643	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	3c12efe1-5994-449d-80e0-d6ba2b0dfdf5
43ad9822-68ed-40ec-81a4-37eb0154af04	70000	2025-05-09 00:00:00	Chợ	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:21:16.184	2025-06-18 15:21:16.184	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
ea02bd4c-9e49-4af5-98e2-be052d6c4730	50000	2025-05-10 00:00:00	Đi chợ	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:21:30.977	2025-06-18 15:21:30.977	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
691a358c-e05f-40f1-9efe-72127d7d47f6	200000	2025-05-17 00:00:00	Chợ	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:22:20.909	2025-06-18 15:22:20.909	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
3a01f7cf-6268-45aa-bbea-df51928a1281	80000	2025-05-19 00:00:00	Chợ	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:22:39.098	2025-06-18 15:22:39.098	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
12496282-854a-4746-8dbe-57e3e2638ec4	90000	2025-05-20 00:00:00	Chợ	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:23:02.964	2025-06-18 15:23:02.964	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9fc61681-965c-4f23-b513-3f4097c91cdc	165000	2025-05-21 00:00:00	Chợ	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:23:28.048	2025-06-18 15:23:28.048	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
e375af53-4ae0-4d66-94f2-12631f3bd295	275000	2025-05-25 00:00:00	Chợ	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:23:51.487	2025-06-18 15:23:51.487	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
a887f656-db0c-4210-b997-26d66642385a	70000	2025-05-27 00:00:00	Chợ	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:24:08.865	2025-06-18 15:24:08.865	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
015bf423-7741-4ae4-9952-67622c1837c8	300000	2025-05-27 00:00:00	Gạo	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 15:24:49.04	2025-06-18 15:24:49.04	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
3cc88043-a19b-4a7c-9ce0-1de367ecf093	85000	2025-06-06 00:00:00	Chợ	expense	94e6e8bf-3a8a-4234-a07c-28c54c1a06e6	t	2025-06-18 15:26:57.651	2025-06-18 15:26:57.651	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
8b2bce29-af05-4431-b038-4a72cf95df7c	20000	2025-06-02 00:00:00	Hoa quả	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:35:51.325	2025-06-18 15:35:51.325	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
66aef7ab-b535-4315-9973-4643a051e1a4	50000	2025-06-02 00:00:00		expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:36:28.01	2025-06-18 15:36:28.01	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
02a491a3-3897-42ad-8df7-2ce6b66e69b7	170000	2025-06-02 00:00:00	Khám thai	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:36:50.027	2025-06-18 15:36:50.027	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
3080ab82-a447-459d-bd8c-eb89e2e4913e	55000	2025-06-03 00:00:00		expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:37:13.417	2025-06-18 15:37:13.417	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
6465404c-16e9-4d11-8bc9-1f4da34e12e0	70000	2025-06-05 00:00:00	Bánh ăn vặt	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:38:23.914	2025-06-18 15:38:23.914	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9b3d3e3f-43fd-4c5f-996e-7a4bbdd321ae	45000	2025-06-05 00:00:00		expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:38:39.769	2025-06-18 15:38:39.769	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9139e4bf-787d-4618-8650-a6a8c0fbc2bf	70000	2025-06-07 00:00:00	Ăn sáng 2vc	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-18 15:39:09.098	2025-06-18 15:39:09.098	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
b06ae27d-ba22-4b92-8c0a-71d57bd71e66	50000	2025-06-07 00:00:00	Gội đầu	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:39:29.932	2025-06-18 15:39:29.932	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
8d43e177-df88-4f28-a286-eb815c52ccb3	40000	2025-06-08 00:00:00	Ăn sáng	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-18 15:40:44.348	2025-06-18 15:40:44.348	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
f3f7793e-afd0-4782-a8d7-bc26b54a08db	128000	2025-06-08 00:00:00	Khẩu trang	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-18 15:39:54.565	2025-06-18 15:41:32.89	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
5fd5f388-5269-41e6-abff-1958f5b536d5	100000	2025-06-08 00:00:00	Chợ	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-18 15:40:13.341	2025-06-18 15:41:53.53	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
723cd4ef-e8a4-415d-ad5b-d772d91a3bdb	40000	2025-06-09 00:00:00	Ăn trưa	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:42:56.499	2025-06-18 15:42:56.499	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
a0d84823-315e-47cc-899d-8b480846d0cd	20000	2025-06-10 00:00:00	Ship	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-18 15:43:29.187	2025-06-18 15:43:29.187	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
8cb7ba80-0f03-4bba-aaf0-210bf57d1910	50000	2025-06-10 00:00:00	Cơm Lê Gia	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:43:53.147	2025-06-18 15:43:53.147	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
c794beb8-8af3-42d7-ba4d-7a0b94e85fca	105000	2025-06-10 00:00:00	Mực viết	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-18 15:44:22.978	2025-06-18 15:44:22.978	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f35b2279-c7d3-4ff6-b867-b79955b5227e
c8d8cab7-1564-42ce-abf4-0e39d781b254	1026000	2025-06-01 00:00:00	Điện t5	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 15:50:21.169	2025-06-18 15:50:21.169	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	1ace540a-7630-41bd-a320-c4b70c0c2e40
9616870e-c2a4-47a0-862f-cfb4dbb23ba4	120000	2025-06-01 00:00:00	Xe	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 15:55:48.322	2025-06-18 15:55:48.322	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
358c3582-50d1-4a1a-a0de-9369c39eb436	57000	2025-06-01 00:00:00	thuốc cảm	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 15:57:32.372	2025-06-18 15:57:32.372	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
c613bfe9-a6a8-42b4-90eb-c9f4f8b0fb9f	27000	2025-06-02 00:00:00	Đồ cúng	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 15:58:17.984	2025-06-18 15:58:17.984	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
e524c664-7e00-413f-a684-790f42f070ba	120000	2025-06-02 00:00:00	Đi xe xuống Vinh	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 15:58:42.809	2025-06-18 15:58:42.809	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
97422838-da0d-4dc5-8744-cd4d472d4d5c	193000	2025-06-02 00:00:00	mua sắt cho vợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:01:21.005	2025-06-18 16:05:26.053	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
e4f7bb61-7190-42a0-812c-8e6b048f8da5	50000	2025-06-02 00:00:00	Tạp hoá	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:07:01.775	2025-06-18 16:07:01.775	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
88ca1d45-3d0c-4f11-95dd-16f7b7ee5067	50000	2025-06-03 00:00:00	Ăn uống trưa	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:09:25.632	2025-06-18 16:09:25.632	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
67bc9aff-f3cc-4179-9e38-8d6f96e11200	50000	2025-06-03 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:09:58.923	2025-06-18 16:09:58.923	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
d0aeef00-9178-4ae6-948f-56c24c03c090	500000	2025-06-04 00:00:00	Giỗ họ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:16:49.971	2025-06-18 16:16:49.971	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}, {"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 50}]	dev-user	99c48cd0-82d4-4c0e-8edd-6e84688360e1
5397c5f9-b389-4521-ad20-57c7ff9ccc05	160000	2025-06-04 00:00:00	Đi xe buýt	expense	16e9f4a9-2cc9-4c42-b0df-445a3a48ad44	t	2025-06-18 16:17:14.956	2025-06-18 16:17:14.956	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}, {"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 50}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
67a8af0f-e32b-4ab6-9170-36a13794e2ce	35000	2025-06-05 00:00:00	Giấy tở hợp đồng cọc	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:20:44.057	2025-06-18 16:20:44.057	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
4f4bb2c3-11b8-42b5-b41d-8291a169e61e	15000	2025-06-04 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:16:20.016	2025-06-18 16:21:28.454	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
1fb98fb5-f079-46d4-a910-c3cda1fa54b8	35000	2025-06-04 00:00:00	Lăn tay	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:21:48.543	2025-06-18 16:21:48.543	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
9510ff35-c3db-4fd1-9bc3-402b35310205	73000	2025-06-06 00:00:00	Ăn uống trưa	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:23:02.518	2025-06-18 16:23:02.518	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
27973d1e-26c9-412e-aaf8-642bb5661166	25000	2025-06-05 00:00:00	Sinh tố	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:23:20.189	2025-06-18 16:23:20.189	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
8e3ac50f-ad8b-47c7-8694-8052dbf036e5	59000	2025-06-06 00:00:00	Tạp hoá	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:24:02.601	2025-06-18 16:24:02.601	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
f15c2eae-8f1c-4f63-be6b-8f7ad2afddfa	276000	2025-06-07 00:00:00	Ốc Liên	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:25:50.971	2025-06-18 16:25:50.971	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	270c1489-c0a3-457d-b778-59e222880073
aa2c35cd-43b2-4fef-bb5e-a2d03469f911	65000	2025-06-08 00:00:00	Đổ xăng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:27:16.708	2025-06-18 16:27:16.708	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
666ae3cd-d683-4707-ad0a-de5a3e4c912d	203000	2025-06-08 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:27:54.641	2025-06-18 16:27:54.641	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
a41087ee-e1cd-47ef-8e76-edf7ab5a4193	115000	2025-06-08 00:00:00	Vở luyện chữ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:28:31.952	2025-06-18 16:28:31.952	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	f35b2279-c7d3-4ff6-b867-b79955b5227e
ed5d3893-2522-4e8c-b11e-a5361dc15a4f	32000	2025-06-09 00:00:00		expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:29:56.442	2025-06-18 16:29:56.442	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
63ea2fe5-7cf9-450d-b723-41a8008df6f9	40000	2025-06-09 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:30:10.036	2025-06-18 16:30:10.036	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9991159c-9bde-4765-a81d-540af5a69afd	70000	2025-06-10 00:00:00	Ăn sáng trưa	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:31:17.29	2025-06-18 16:31:17.29	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
34005f66-003e-496b-85ae-773dfdcbcb0a	28000	2025-06-10 00:00:00	Tạp hoá	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:31:44.816	2025-06-18 16:31:44.816	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
37268447-67ac-41ef-b15f-106844740836	98000	2025-06-10 00:00:00	Thuốc O Thảo	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:32:02.36	2025-06-18 16:32:28.107	[{"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
83ca1899-5e42-47bd-8ea7-01ba0de413ec	65000	2025-06-11 00:00:00	Ăn trưa	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:33:05.474	2025-06-18 16:33:05.474	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
3932486a-0273-4711-b81d-2b190b7812c1	35000	2025-06-12 00:00:00	Cháo gà cho vợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:33:53.394	2025-06-18 16:33:53.394	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
e6882aee-1d06-43e1-88a4-bbf09879b21c	970000	2025-06-12 00:00:00	Canxi + Blackmore (Long Châu)	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:34:47.048	2025-06-18 16:34:47.048	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
a16edff4-0492-44ea-bc7a-159da053888b	95000	2025-06-12 00:00:00	Nước t5	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:35:14.073	2025-06-18 16:35:14.073	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
8a753d3b-8437-49e9-9e90-229ac0d058c0	180000	2025-06-12 00:00:00	Gà bà Hiền chợ Ga (1,5kg)	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:35:56.67	2025-06-18 16:35:56.67	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
a7929cf0-ebba-48f5-ae67-e97b7872febb	30000	2025-06-12 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:36:21.064	2025-06-18 16:36:21.064	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
0a0deffa-a613-4182-8da2-db42345d5961	264000	2025-06-15 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:38:49.349	2025-06-18 16:40:30.686	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
af738689-96c6-40a6-9fae-506d8467c483	70000	2025-06-19 00:00:00	Ăn tối	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	t	2025-06-19 13:37:41.185	2025-06-19 13:37:41.185	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
46b34834-e653-4742-b422-bb892e727cd7	65000	2025-06-15 00:00:00	Xăng	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:41:44.408	2025-06-18 16:41:44.408	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	714920cc-22c9-4e14-a8cd-88d488ffeb58
f3651998-eef6-47df-be25-ce877056ad20	30000	2025-06-15 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:42:13.185	2025-06-18 16:42:13.185	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
af5d8e4b-b63a-4843-86f8-0159d5ac847e	50000	2025-06-16 00:00:00	Ăn sáng	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:44:37.514	2025-06-18 16:44:37.514	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
e53d7d48-ef92-4e4b-99ee-152b3f391e81	50000	2025-06-16 00:00:00	Tiền điện thoại trả trước	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:45:05.39	2025-06-18 16:45:05.39	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
a28cdb04-983a-4d17-ba23-55cf36051a2f	180000	2025-06-16 00:00:00	Internet t5	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:46:21.909	2025-06-18 16:46:21.909	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
968aaca9-df1c-454d-b342-f98295df2180	65000	2025-06-18 00:00:00	Trưa	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:46:47.802	2025-06-18 16:46:47.802	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
b042cfa1-f9ad-451a-b4c2-a1cb51a62350	270000	2025-06-18 00:00:00	Daflon 500 hộp 60 viên	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-18 16:47:21.452	2025-06-18 16:47:21.452	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	76528a8a-a82a-4ef0-87aa-256ac621b43b
1775179d-1772-4812-84ef-8b4f79852d2f	10000	2025-06-18 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:47:36.334	2025-06-18 16:47:36.334	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
cdd97a6e-d62c-43e8-80d7-5dc5bc58e8f7	3000000	2025-06-01 00:00:00	Nhà t6	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-18 16:49:32.427	2025-06-18 16:49:32.427	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	3c12efe1-5994-449d-80e0-d6ba2b0dfdf5
2975d458-a4a2-4405-9f76-d895e0e3a87d	1000000	2025-06-19 00:00:00	Chảo kuchen	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-20 16:01:01.152	2025-06-20 16:01:01.152	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 50}]	dev-user	f9ddbc54-fbb9-42f3-ac57-d17aa2b9f857
2369f4e9-a3b6-4d25-ada5-5386614a566e	50000	2025-06-20 00:00:00	Ăn trưa	expense	910b287d-d365-4daa-83d5-11c096b07068	f	2025-06-20 16:04:16.214	2025-06-20 16:04:16.214	[{"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
e8ba5eb6-a41f-4a37-8fb9-c7479585a6d3	130000	2025-06-20 00:00:00	Chợ	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-20 16:04:56.404	2025-06-20 16:04:56.404	[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 25}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}, {"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 25}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
2615510f-f7ed-448d-b353-eea4e15ef215	25000	2025-06-20 00:00:00	Dừa	expense	910b287d-d365-4daa-83d5-11c096b07068	t	2025-06-20 16:05:11.925	2025-06-20 16:05:11.925	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
9d1e2d91-5ae6-40a0-b4d8-5ea227a8f3cb	67000	2025-06-20 00:00:00	Ăn uống	expense	577ee6f9-283e-46c7-bbb3-9910bc70e2d5	f	2025-06-20 16:05:51.927	2025-06-20 16:05:51.927	[{"memberId": "577ee6f9-283e-46c7-bbb3-9910bc70e2d5", "percentage": 100}]	dev-user	37d6ca79-243b-4ed4-9d77-8675215393c6
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."User" (id, email, password, "createdAt", "updatedAt") FROM stdin;
dev-user	dev@example.com	$2a$10$cD0ZFGx3P527MoqaSaunrOUzRe6NtTJN9Aaz38FK41ZQ6jE22T.zW	2025-06-09 14:51:18.812	2025-06-09 14:51:18.812
42193bed-a5c8-424f-9ba0-6732e48361a1	test@example.com	$2a$10$ikKATTlYLt8S1LKH3daLYuuFz2sbIP4s2w5GYk76NqpWh8TDTcgti	2025-06-21 17:00:09.422	2025-06-21 17:00:09.422
2e5841b9-518c-4eb6-89fa-7bbf117b546d	nhduc.seuit@gmail.com	$2a$10$T44u7KzJbNqNS19feg6dyOP7iwfsWo0EHAGKyiAUdLypThZ5pJZVC	2025-06-21 17:08:22.445	2025-06-21 17:08:22.445
d848cfca-b85c-41cb-b9c7-d8321ff7346f	langhathudiep@gmail.com	$2a$10$Lj6jouxjmO17Q.O3ny/LHuTKrzV9sUAA9CbjMHOl8pGlNjRojrzn6	2025-06-22 11:14:30.891	2025-06-22 11:14:30.891
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
574d832f-90d0-4269-9a53-35a399498aa5	c425b6d060c3e73595eba086f598b3af9b88a4f1fc7a572cde2e2e22020053c9	2025-06-08 19:45:42.33425+00	20250607143200_init	\N	\N	2025-06-08 19:45:42.311557+00	1
823487f7-fce8-4994-8386-b11832189524	32d838b96875ad6ab5355f384a1a8f641f204c44d6aff175b3a8a87f84044b62	2025-06-10 16:44:47.58438+00	20250610133516_add_predefined_split_ratio_table	\N	\N	2025-06-10 16:44:47.559418+00	1
4cdef1e3-784b-42f9-b00f-9b9d0db86491	380f2d121aa0e0556f17c524acbe21a66fcd57c7b8652a0cdd1bcb9f284236b8	2025-06-16 04:23:27.315103+00	20250616034507_add_settlement_model	\N	\N	2025-06-16 04:23:27.268588+00	1
\.


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: HouseholdMember HouseholdMember_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."HouseholdMember"
    ADD CONSTRAINT "HouseholdMember_pkey" PRIMARY KEY (id);


--
-- Name: PredefinedSplitRatio PredefinedSplitRatio_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."PredefinedSplitRatio"
    ADD CONSTRAINT "PredefinedSplitRatio_pkey" PRIMARY KEY (id);


--
-- Name: Settlement Settlement_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: PredefinedSplitRatio_userId_idx; Type: INDEX; Schema: public; Owner: youruser
--

CREATE INDEX "PredefinedSplitRatio_userId_idx" ON public."PredefinedSplitRatio" USING btree ("userId");


--
-- Name: PredefinedSplitRatio_userId_name_key; Type: INDEX; Schema: public; Owner: youruser
--

CREATE UNIQUE INDEX "PredefinedSplitRatio_userId_name_key" ON public."PredefinedSplitRatio" USING btree ("userId", name);


--
-- Name: Settlement_payeeId_idx; Type: INDEX; Schema: public; Owner: youruser
--

CREATE INDEX "Settlement_payeeId_idx" ON public."Settlement" USING btree ("payeeId");


--
-- Name: Settlement_payerId_idx; Type: INDEX; Schema: public; Owner: youruser
--

CREATE INDEX "Settlement_payerId_idx" ON public."Settlement" USING btree ("payerId");


--
-- Name: Settlement_userId_idx; Type: INDEX; Schema: public; Owner: youruser
--

CREATE INDEX "Settlement_userId_idx" ON public."Settlement" USING btree ("userId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: youruser
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id);


--
-- Name: Category Category_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: HouseholdMember HouseholdMember_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."HouseholdMember"
    ADD CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PredefinedSplitRatio PredefinedSplitRatio_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."PredefinedSplitRatio"
    ADD CONSTRAINT "PredefinedSplitRatio_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Settlement Settlement_payeeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES public."HouseholdMember"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Settlement Settlement_payerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES public."HouseholdMember"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Settlement Settlement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

