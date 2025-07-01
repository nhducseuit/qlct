--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
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
    "familyId" text NOT NULL
);


ALTER TABLE public."Category" OWNER TO youruser;

--
-- Name: Family; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public."Family" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "parentId" text
);


ALTER TABLE public."Family" OWNER TO youruser;

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
    "familyId" text NOT NULL
);


ALTER TABLE public."HouseholdMember" OWNER TO youruser;

--
-- Name: PredefinedSplitRatio; Type: TABLE; Schema: public; Owner: youruser
--

CREATE TABLE public."PredefinedSplitRatio" (
    id text NOT NULL,
    name text NOT NULL,
    "splitRatio" jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "familyId" text NOT NULL
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
    "familyId" text NOT NULL
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
    "categoryId" text NOT NULL,
    "familyId" text NOT NULL
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
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "familyId" text NOT NULL
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

COPY public."Category" (id, name, "parentId", icon, color, "isPinned", "order", "isHidden", "budgetLimit", "createdAt", "updatedAt", "defaultSplitRatio", "familyId") FROM stdin;
4ef18cac-ff12-440a-9f88-71ad6d4240c9	Cat-Utils	\N		\N	t	1	f	\N	2025-06-17 16:32:13.063	2025-06-29 08:55:41.306	[]	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
24b29c20-4d2d-4152-9f23-bc0dafab0db4	Cat-Personal	\N		\N	t	2	f	\N	2025-06-17 16:32:22.919	2025-06-29 08:55:41.306	[]	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
8dc553cf-b05d-41b6-a309-23cdf1613027	 Cat-Food	\N		\N	f	0	f	\N	2025-06-17 16:32:05.17	2025-06-29 08:55:41.306	[]	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
\.


--
-- Data for Name: Family; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."Family" (id, name, "createdAt", "updatedAt", "parentId") FROM stdin;
55556efe-7d9f-463d-930b-9af37abde0be	dev@example.com's Family	2025-06-29 08:55:41.275	2025-06-29 08:55:41.275	\N
5a97d6ec-6c64-4eec-ba7d-bab71b7df688	nhduc.seuit@gmail.com's Family	2025-06-29 08:55:41.302	2025-06-29 08:55:41.302	\N
\.


--
-- Data for Name: HouseholdMember; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."HouseholdMember" (id, name, "isActive", "order", "createdAt", "updatedAt", "familyId") FROM stdin;
71325e5a-ee69-4e3a-a224-335e12f4ac15	C	t	\N	2025-06-17 16:33:52.673	2025-06-29 08:55:41.306	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
46541728-9732-4c83-a2e8-2b1b31df5bcf	D	t	\N	2025-06-17 18:07:53.993	2025-06-29 08:55:41.306	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	A	t	4	2025-06-17 16:33:42.956	2025-06-29 08:55:41.306	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
fbe16a95-4457-4987-b953-59b88bdfff7c	B	t	4	2025-06-17 16:33:50.364	2025-06-29 08:55:41.306	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
\.


--
-- Data for Name: PredefinedSplitRatio; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."PredefinedSplitRatio" (id, name, "splitRatio", "createdAt", "updatedAt", "familyId") FROM stdin;
b3396d63-7620-40fa-999a-5a6323069d24	Chia đều 2 người	[{"memberId": "595f26ec-a8d2-4b5d-9fc0-0a2856d341d9", "percentage": 50}, {"memberId": "fbe16a95-4457-4987-b953-59b88bdfff7c", "percentage": 50}]	2025-06-10 16:16:18.487	2025-06-29 08:55:41.306	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
2a1b71b6-7f26-4bfa-b7b2-9fecccee9030	Chia đều 4 người	[{"memberId": "595f26ec-a8d2-4b5d-9fc0-0a2856d341d9", "percentage": 25}, {"memberId": "fbe16a95-4457-4987-b953-59b88bdfff7c", "percentage": 25}, {"memberId": "71325e5a-ee69-4e3a-a224-335e12f4ac15", "percentage": 25}, {"memberId": "46541728-9732-4c83-a2e8-2b1b31df5bcf", "percentage": 25}]	2025-06-10 16:18:01.149	2025-06-29 08:55:41.306	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
555872e7-492c-4960-b2a0-c33f518c7035	Chia đều 3 người	[{"memberId": "595f26ec-a8d2-4b5d-9fc0-0a2856d341d9", "percentage": 33}, {"memberId": "fbe16a95-4457-4987-b953-59b88bdfff7c", "percentage": 34}, {"memberId": "71325e5a-ee69-4e3a-a224-335e12f4ac15", "percentage": 33}]	2025-06-10 16:17:13.702	2025-06-29 08:55:41.306	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
\.


--
-- Data for Name: Settlement; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."Settlement" (id, amount, date, note, "createdAt", "updatedAt", "payerId", "payeeId", "familyId") FROM stdin;
3047559e-1749-46c2-84b6-0c1a4026f3bd	1	2025-06-21 17:00:00+00		2025-06-22 11:04:38.486	2025-06-29 08:55:41.306	fbe16a95-4457-4987-b953-59b88bdfff7c	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
a92bb74c-5b56-4229-9e29-5793a5745cb1	1	2025-06-21 17:00:00+00	33	2025-06-22 13:52:27.282	2025-06-29 08:55:41.306	fbe16a95-4457-4987-b953-59b88bdfff7c	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
9446aac4-df6b-43eb-9097-1bba7bf3a423	1	2025-06-17 17:00:00+00	swwww	2025-06-18 14:24:03.778	2025-06-29 08:55:41.306	fbe16a95-4457-4987-b953-59b88bdfff7c	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
52b9c7b3-ceda-402b-a0b4-0b0db3b0886c	2	2025-06-17 17:00:00+00	eeee	2025-06-18 14:33:17.793	2025-06-29 08:55:41.306	fbe16a95-4457-4987-b953-59b88bdfff7c	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
30042a22-b886-4c20-9b6d-d2b0e146ae67	2	2025-06-17 17:00:00+00	333	2025-06-18 14:33:28.406	2025-06-29 08:55:41.306	71325e5a-ee69-4e3a-a224-335e12f4ac15	fbe16a95-4457-4987-b953-59b88bdfff7c	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
d4e546c8-cc4e-43d3-9523-311935351266	1	2025-06-17 17:00:00+00	222	2025-06-18 14:36:09.823	2025-06-29 08:55:41.306	fbe16a95-4457-4987-b953-59b88bdfff7c	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
e616771f-449e-44b0-873f-94d3522ed4c9	1	2025-06-17 17:00:00+00	111	2025-06-18 14:36:23.206	2025-06-29 08:55:41.306	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	fbe16a95-4457-4987-b953-59b88bdfff7c	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
3ec0196e-1695-4d2a-a6a0-25ff4b9996a1	2	2025-06-22 17:00:00+00		2025-06-23 01:27:32.551	2025-06-29 08:55:41.306	71325e5a-ee69-4e3a-a224-335e12f4ac15	fbe16a95-4457-4987-b953-59b88bdfff7c	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."Transaction" (id, amount, date, note, type, payer, "isShared", "createdAt", "updatedAt", "splitRatio", "categoryId", "familyId") FROM stdin;
644405e5-3e2b-4ecf-ae92-0cc9951c5bad	80	2025-06-17 00:00:00		expense	fbe16a95-4457-4987-b953-59b88bdfff7c	t	2025-06-17 16:38:02.68	2025-06-29 08:55:41.306	[{"memberId": "fbe16a95-4457-4987-b953-59b88bdfff7c", "percentage": 100}]	8dc553cf-b05d-41b6-a309-23cdf1613027	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
d61a0700-5454-47b6-a392-b7f70f676907	200	2025-06-17 00:00:00		expense	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	t	2025-06-17 16:36:27.144	2025-06-29 08:55:41.306	[{"memberId": "595f26ec-a8d2-4b5d-9fc0-0a2856d341d9", "percentage": 50}, {"memberId": "fbe16a95-4457-4987-b953-59b88bdfff7c", "percentage": 50}]	8dc553cf-b05d-41b6-a309-23cdf1613027	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
213b6db1-35c8-4466-af9c-92dc5e57916f	300	2025-06-17 00:00:00		expense	fbe16a95-4457-4987-b953-59b88bdfff7c	t	2025-06-17 16:37:07.424	2025-06-29 08:55:41.306	[{"memberId": "595f26ec-a8d2-4b5d-9fc0-0a2856d341d9", "percentage": 30}, {"memberId": "fbe16a95-4457-4987-b953-59b88bdfff7c", "percentage": 30}, {"memberId": "71325e5a-ee69-4e3a-a224-335e12f4ac15", "percentage": 40}]	4ef18cac-ff12-440a-9f88-71ad6d4240c9	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
f11633c7-530d-4d8a-a717-4cc64d9491ba	500	2025-06-17 00:00:00		income	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	f	2025-06-17 16:37:36.388	2025-06-29 08:55:41.306	[{"memberId": "595f26ec-a8d2-4b5d-9fc0-0a2856d341d9", "percentage": 100}]	8dc553cf-b05d-41b6-a309-23cdf1613027	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
477149ec-3fa8-48fc-9a5e-d8ee11747cee	120	2025-06-17 00:00:00		expense	71325e5a-ee69-4e3a-a224-335e12f4ac15	t	2025-06-17 16:38:32.83	2025-06-29 08:55:41.306	[{"memberId": "fbe16a95-4457-4987-b953-59b88bdfff7c", "percentage": 60}, {"memberId": "71325e5a-ee69-4e3a-a224-335e12f4ac15", "percentage": 40}]	4ef18cac-ff12-440a-9f88-71ad6d4240c9	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
7c93b89a-3253-4b5f-b5b4-da55dd7c4c87	1000000	2025-06-17 00:00:00		expense	595f26ec-a8d2-4b5d-9fc0-0a2856d341d9	f	2025-06-17 16:35:54.271	2025-06-29 08:55:41.306	[{"memberId": "595f26ec-a8d2-4b5d-9fc0-0a2856d341d9", "percentage": 100}]	8dc553cf-b05d-41b6-a309-23cdf1613027	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public."User" (id, email, password, "createdAt", "updatedAt", "familyId") FROM stdin;
dev-user	dev@example.com	somehashedpassword	2025-06-07 23:55:05.682	2025-06-29 08:55:41.28	55556efe-7d9f-463d-930b-9af37abde0be
0a5329d6-8b0b-42e0-b387-38deb51fe610	nhduc.seuit@gmail.com	$2a$10$rQ3ehTNG.rAD9N7dQ8w.UeeKnt4p.1K9nAAMXKE4kPDaOSk/V1J2C	2025-06-20 15:55:38.938	2025-06-29 08:55:41.304	5a97d6ec-6c64-4eec-ba7d-bab71b7df688
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: youruser
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
949a6899-8224-4203-a700-ba92bc7e0aa4	c425b6d060c3e73595eba086f598b3af9b88a4f1fc7a572cde2e2e22020053c9	2025-06-07 14:32:00.519907+00	20250607143200_init	\N	\N	2025-06-07 14:32:00.507471+00	1
f55f5959-4f63-499f-a8cd-dd3cea8426c3	32d838b96875ad6ab5355f384a1a8f641f204c44d6aff175b3a8a87f84044b62	2025-06-10 13:35:17.192804+00	20250610133516_add_predefined_split_ratio_table	\N	\N	2025-06-10 13:35:17.178899+00	1
b6834679-63fc-4756-ae42-595b21e17e04	380f2d121aa0e0556f17c524acbe21a66fcd57c7b8652a0cdd1bcb9f284236b8	2025-06-16 03:45:07.596195+00	20250616034507_add_settlement_model	\N	\N	2025-06-16 03:45:07.582756+00	1
c86039a8-2edd-483a-8104-d5d2b10f536f	d3b6a505261d6b62d5b83aa975f6a7b33561582bc826ac56237d54bc79458d27	2025-06-29 08:52:54.396702+00	20250629085254_add_family_model_optional	\N	\N	2025-06-29 08:52:54.378152+00	1
1fe18b0e-0407-4a06-a419-642ce86645a8	eb157b09ae3ef699aa5bb2aa1e3ffb0e2e93ffe1cebe7ffb6e142c93787fecec	2025-06-29 09:32:00.675402+00	20250629093200_finalize_family_model	\N	\N	2025-06-29 09:32:00.646782+00	1
\.


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Family Family_pkey; Type: CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Family"
    ADD CONSTRAINT "Family_pkey" PRIMARY KEY (id);


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
-- Name: PredefinedSplitRatio_familyId_idx; Type: INDEX; Schema: public; Owner: youruser
--

CREATE INDEX "PredefinedSplitRatio_familyId_idx" ON public."PredefinedSplitRatio" USING btree ("familyId");


--
-- Name: PredefinedSplitRatio_familyId_name_key; Type: INDEX; Schema: public; Owner: youruser
--

CREATE UNIQUE INDEX "PredefinedSplitRatio_familyId_name_key" ON public."PredefinedSplitRatio" USING btree ("familyId", name);


--
-- Name: Settlement_familyId_idx; Type: INDEX; Schema: public; Owner: youruser
--

CREATE INDEX "Settlement_familyId_idx" ON public."Settlement" USING btree ("familyId");


--
-- Name: Settlement_payeeId_idx; Type: INDEX; Schema: public; Owner: youruser
--

CREATE INDEX "Settlement_payeeId_idx" ON public."Settlement" USING btree ("payeeId");


--
-- Name: Settlement_payerId_idx; Type: INDEX; Schema: public; Owner: youruser
--

CREATE INDEX "Settlement_payerId_idx" ON public."Settlement" USING btree ("payerId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: youruser
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Category Category_familyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES public."Family"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Category Category_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Category"(id);


--
-- Name: Family Family_parentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Family"
    ADD CONSTRAINT "Family_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES public."Family"(id);


--
-- Name: HouseholdMember HouseholdMember_familyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."HouseholdMember"
    ADD CONSTRAINT "HouseholdMember_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES public."Family"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PredefinedSplitRatio PredefinedSplitRatio_familyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."PredefinedSplitRatio"
    ADD CONSTRAINT "PredefinedSplitRatio_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES public."Family"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Settlement Settlement_familyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Settlement"
    ADD CONSTRAINT "Settlement_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES public."Family"(id) ON UPDATE CASCADE ON DELETE CASCADE;


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
-- Name: Transaction Transaction_categoryId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES public."Category"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Transaction Transaction_familyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES public."Family"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_familyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: youruser
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES public."Family"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

