--
-- PostgreSQL database dump
--

\restrict EAxVSOfQ9JRq8T6xY6ccq3NJLarzsGfRknZWKtuA6bLqg9Ws8GUOzwA7HibFQ3U

-- Dumped from database version 16.11
-- Dumped by pg_dump version 16.11

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: DepositStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DepositStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED'
);


--
-- Name: NotificationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationStatus" AS ENUM (
    'UNREAD',
    'READ'
);


--
-- Name: ProductStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ProductStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'OUT_OF_STOCK'
);


--
-- Name: PurchaseStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PurchaseStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'CANCELLED',
    'REFUNDED'
);


--
-- Name: TaskRunState; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaskRunState" AS ENUM (
    'STARTED',
    'ASSIGNED',
    'SUBMITTED',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: TransactionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionStatus" AS ENUM (
    'POSTED',
    'VOID'
);


--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TransactionType" AS ENUM (
    'CREDIT',
    'DEBIT',
    'REWARD',
    'COMMISSION',
    'ADMIN_ADJUSTMENT',
    'DEPOSIT',
    'WITHDRAWAL',
    'LUCKY_WHEEL',
    'TASK_DEPOSIT',
    'TASK_REFUND'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'USER',
    'OPERATOR',
    'ADMIN'
);


--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'SUSPENDED',
    'BANNED'
);


--
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'PROCESSING'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdminAuditLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AdminAuditLog" (
    id text NOT NULL,
    "adminId" text NOT NULL,
    action text NOT NULL,
    "targetUserId" text,
    "beforeBalance" numeric(20,2),
    "afterBalance" numeric(20,2),
    note text,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ChatMessage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatMessage" (
    id text NOT NULL,
    "userId" text,
    message text NOT NULL,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: DepositRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DepositRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(20,2) NOT NULL,
    status public."DepositStatus" DEFAULT 'PENDING'::public."DepositStatus" NOT NULL,
    "paymentMethod" text,
    "paymentProof" text,
    note text,
    "adminNote" text,
    "processedBy" text,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: LuckyWheelSpin; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."LuckyWheelSpin" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "wheelPrizeId" text,
    "prizeName" text NOT NULL,
    "prizeImage" text,
    "prizeType" text DEFAULT 'PRODUCT'::text NOT NULL,
    "prizeValue" numeric(20,2),
    "shippingAddress" text,
    "shippingPhone" text,
    "shippingName" text,
    "shippingStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "isFreeSpin" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id text NOT NULL,
    "userId" text,
    title text NOT NULL,
    message text NOT NULL,
    type text DEFAULT 'INFO'::text NOT NULL,
    status public."NotificationStatus" DEFAULT 'UNREAD'::public."NotificationStatus" NOT NULL,
    "createdBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(20,2) NOT NULL,
    "imageUrl" text,
    stock integer DEFAULT 0 NOT NULL,
    status public."ProductStatus" DEFAULT 'ACTIVE'::public."ProductStatus" NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: ProductPurchase; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProductPurchase" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    price numeric(20,2) NOT NULL,
    "totalAmount" numeric(20,2) NOT NULL,
    status public."PurchaseStatus" DEFAULT 'PENDING'::public."PurchaseStatus" NOT NULL,
    note text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: SystemSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SystemSettings" (
    id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    description text,
    "updatedBy" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    "vipLevelId" text NOT NULL,
    name text NOT NULL,
    description text,
    "basePrice" numeric(20,2) NOT NULL,
    "rewardRate" numeric(5,4) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TaskProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TaskProduct" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "imageUrl" text,
    "basePrice" numeric(20,2) NOT NULL,
    "vipLevelId" text,
    "isActive" boolean DEFAULT true NOT NULL,
    stock integer DEFAULT 999999 NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: TaskRun; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TaskRun" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "taskId" text NOT NULL,
    "taskProductId" text,
    state public."TaskRunState" DEFAULT 'STARTED'::public."TaskRunState" NOT NULL,
    "assignedPrice" numeric(20,2),
    "commissionRate" numeric(5,4),
    "rewardAmount" numeric(20,2),
    "totalRefund" numeric(20,2),
    "idempotencyKey" text NOT NULL,
    metadata jsonb,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "submittedAt" timestamp(3) without time zone,
    "completedAt" timestamp(3) without time zone
);


--
-- Name: Transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transaction" (
    id text NOT NULL,
    "userId" text NOT NULL,
    type public."TransactionType" NOT NULL,
    amount numeric(20,2) NOT NULL,
    status public."TransactionStatus" DEFAULT 'POSTED'::public."TransactionStatus" NOT NULL,
    "referenceId" text,
    "idempotencyKey" text NOT NULL,
    description text NOT NULL,
    "createdBy" text,
    metadata jsonb,
    "balanceBefore" numeric(20,2) NOT NULL,
    "balanceAfter" numeric(20,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    username text NOT NULL,
    email text,
    phone text,
    "passwordHash" text NOT NULL,
    "withdrawalPinHash" text,
    role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "inviteCode" text,
    "referredBy" text,
    balance numeric(20,2) DEFAULT 0 NOT NULL,
    "freeSpins" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: VipLevel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."VipLevel" (
    id text NOT NULL,
    name text NOT NULL,
    "minBalance" numeric(20,2) NOT NULL,
    "commissionRate" numeric(5,4) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WheelPrize; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WheelPrize" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "imageUrl" text,
    "prizeType" text DEFAULT 'PRODUCT'::text NOT NULL,
    value numeric(20,2),
    probability numeric(5,4) NOT NULL,
    color text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    stock integer DEFAULT 999999 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WithdrawalRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WithdrawalRequest" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount numeric(20,2) NOT NULL,
    status public."WithdrawalStatus" DEFAULT 'PENDING'::public."WithdrawalStatus" NOT NULL,
    "bankName" text,
    "bankAccount" text,
    "bankAccountName" text,
    note text,
    "adminNote" text,
    "processedBy" text,
    "processedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Data for Name: AdminAuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AdminAuditLog" (id, "adminId", action, "targetUserId", "beforeBalance", "afterBalance", note, metadata, "createdAt") FROM stdin;
\.


--
-- Data for Name: ChatMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatMessage" (id, "userId", message, "isAdmin", "createdAt") FROM stdin;
cmjcizic400068hi2nq32bwej	cmjccnuf4000111grqchnlj30	chào	f	2025-12-19 07:05:58.419
\.


--
-- Data for Name: DepositRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DepositRequest" (id, "userId", amount, status, "paymentMethod", "paymentProof", note, "adminNote", "processedBy", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: LuckyWheelSpin; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LuckyWheelSpin" (id, "userId", "wheelPrizeId", "prizeName", "prizeImage", "prizeType", "prizeValue", "shippingAddress", "shippingPhone", "shippingName", "shippingStatus", "isFreeSpin", "createdAt", "updatedAt") FROM stdin;
cmjcjqxrk000u8hi26yqfvequ	cmjccnuf4000111grqchnlj30	\N	iphone		PRODUCT	\N	\N	\N	\N	PENDING	t	2025-12-19 07:27:18.128	2025-12-19 07:27:18.128
cmjcjur80000x8hi2ltkpv8pe	cmjccnuf4000111grqchnlj30	\N	iphone		PRODUCT	\N	\N	\N	\N	PENDING	t	2025-12-19 07:30:16.272	2025-12-19 07:30:16.272
cmjcd4pyn000axfhdjri5x7yf	cmjccnuf4000111grqchnlj30	\N	iphog	/uploads/products/1766117040328-wob45p.png	PRODUCT	100.00	\N	\N	\N	PENDING	t	2025-12-19 04:22:03.887	2025-12-19 04:22:03.887
cmjcludx0001dg4a85wk0gmu8	cmjccnuf4000111grqchnlj30	cmjck4jpl000096hu1ia68i50	iphone	/uploads/products/1766129879727-py52tl.jpg	PRODUCT	100.00	\N	\N	\N	PENDING	t	2025-12-19 08:25:58.26	2025-12-19 08:25:58.26
cmjcmvpi9001gg4a8v2dg3wkl	cmjccnuf4000111grqchnlj30	cmjck57qi000196hu8fubcuro	aplle		PRODUCT	200.01	\N	\N	\N	PENDING	t	2025-12-19 08:54:59.551	2025-12-19 08:54:59.551
cmjcmx1lu001ng4a8cv2tl5l9	cmjccnuf4000111grqchnlj30	cmjck57qi000196hu8fubcuro	aplle		PRODUCT	200.01	\N	\N	\N	PENDING	t	2025-12-19 08:56:01.89	2025-12-19 08:56:01.89
cmjcn17es001qg4a84pqntxqa	cmjccnuf4000111grqchnlj30	cmjck4jpl000096hu1ia68i50	iphone	/uploads/products/1766129879727-py52tl.jpg	PRODUCT	100.00	\N	\N	\N	PENDING	t	2025-12-19 08:59:16.036	2025-12-19 08:59:16.036
cmjcn49vp001tg4a8lfa1ktk9	cmjccnuf4000111grqchnlj30	cmjck4jpl000096hu1ia68i50	iphone	/uploads/products/1766129879727-py52tl.jpg	PRODUCT	100.00	\N	\N	\N	PENDING	t	2025-12-19 09:01:39.205	2025-12-19 09:01:39.205
\.


--
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Notification" (id, "userId", title, message, type, status, "createdBy", "createdAt", "updatedAt") FROM stdin;
cmjckru7y0001g4a8xdgr44wo	\N	dfdf	dfdfd	INFO	UNREAD	cmjccnuf4000111grqchnlj30	2025-12-19 07:55:59.776	2025-12-19 07:55:59.776
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, name, description, price, "imageUrl", stock, status, "sortOrder", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ProductPurchase; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProductPurchase" (id, "userId", "productId", quantity, price, "totalAmount", status, note, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: SystemSettings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SystemSettings" (id, key, value, description, "updatedBy", "createdAt", "updatedAt") FROM stdin;
cmjciyp0y00018hi2nveoa137	support_phone	19001010	\N	cmjccnuf4000111grqchnlj30	2025-12-19 07:05:20.43	2025-12-19 08:04:21.018
cmjciyp0y00008hi2x5ntdmce	deposit_bank_name	vietcombank	\N	cmjccnuf4000111grqchnlj30	2025-12-19 07:05:20.43	2025-12-19 08:04:21.018
cmjciyp1k00028hi2ayfypn5c	support_email	aloha@gmail.com	\N	cmjccnuf4000111grqchnlj30	2025-12-19 07:05:20.43	2025-12-19 08:04:21.018
cmjciyp1n00048hi2n4fearkj	deposit_bank_account	123456789	\N	cmjccnuf4000111grqchnlj30	2025-12-19 07:05:20.433	2025-12-19 08:04:21.018
cmjciyp1n00038hi2uiygfbf6	deposit_account_name		\N	cmjccnuf4000111grqchnlj30	2025-12-19 07:05:20.431	2025-12-19 08:04:21.018
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Task" (id, "vipLevelId", name, description, "basePrice", "rewardRate", "isActive", "createdAt", "updatedAt") FROM stdin;
cmjccypvs00012yga2ohze9wy	cmjccykx00000ux222rstuutx	Nhiệm vụ Thành viên	Nhiệm vụ dành cho thành viên Thành viên	100.00	0.0050	t	2025-12-19 04:17:23.848	2025-12-19 04:17:23.848
cmjccypw500032yga92jiyxus	cmjccykxg0001ux226hb4vkje	Nhiệm vụ Thành viên Vàng	Nhiệm vụ dành cho thành viên Thành viên Vàng	100.00	0.0100	t	2025-12-19 04:17:23.862	2025-12-19 04:17:23.862
cmjccypwh00052ygak4u9ktzq	cmjccykxn0002ux221f8atia7	Nhiệm vụ Thành viên Bạc	Nhiệm vụ dành cho thành viên Thành viên Bạc	100.00	0.0150	t	2025-12-19 04:17:23.873	2025-12-19 04:17:23.873
cmjccypwr00072yga2tzl7plz	cmjccykxu0003ux22r6btbzlm	Nhiệm vụ Thành viên Kim Cương	Nhiệm vụ dành cho thành viên Thành viên Kim Cương	100.00	0.0200	t	2025-12-19 04:17:23.884	2025-12-19 04:17:23.884
\.


--
-- Data for Name: TaskProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TaskProduct" (id, name, description, "imageUrl", "basePrice", "vipLevelId", "isActive", stock, "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmjccpi6c000511grix68ifwp	1111	111111	/uploads/products/1766117410571-tavw31.jpg	222.00	\N	t	999991	1	2025-12-19 04:10:13.957	2025-12-19 08:25:12.252
\.


--
-- Data for Name: TaskRun; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TaskRun" (id, "userId", "taskId", "taskProductId", state, "assignedPrice", "commissionRate", "rewardAmount", "totalRefund", "idempotencyKey", metadata, "createdAt", "submittedAt", "completedAt") FROM stdin;
cmjcd0wju0001xfhd1yvue85h	cmjccnuf4000111grqchnlj30	cmjccypwr00072yga2tzl7plz	cmjccpi6c000511grix68ifwp	COMPLETED	222.00	0.0200	4.44	226.44	pnFKxSUmdzzGEEmGb4iaE	{"vipLevel": "Thành viên Kim Cương", "productName": "1111", "commissionRate": 0.02}	2025-12-19 04:19:05.802	2025-12-19 04:19:07.585	2025-12-19 04:21:46.486
cmjcj0bk0000d8hi2r8woo2dh	cmjccnuf4000111grqchnlj30	cmjccypwr00072yga2tzl7plz	cmjccpi6c000511grix68ifwp	COMPLETED	222.00	0.0200	4.44	226.44	fsXz6CE7nSeAtkhjFgJaJ	{"vipLevel": "Thành viên Kim Cương", "productName": "1111", "commissionRate": 0.02}	2025-12-19 07:06:36.288	2025-12-19 07:06:37.196	2025-12-19 07:06:57.543
cmjcj08ea00088hi2f7n85zbp	cmjccnuf4000111grqchnlj30	cmjccypwr00072yga2tzl7plz	cmjccpi6c000511grix68ifwp	COMPLETED	222.00	0.0200	4.44	226.44	3jKbstQ9PVH-l6MkVVljz	{"vipLevel": "Thành viên Kim Cương", "productName": "1111", "commissionRate": 0.02}	2025-12-19 07:06:32.194	2025-12-19 07:06:34.102	2025-12-19 07:07:01.931
cmjcltdwe000sg4a8zelvzylv	cmjccnuf4000111grqchnlj30	cmjccypwr00072yga2tzl7plz	cmjccpi6c000511grix68ifwp	COMPLETED	222.00	0.0200	4.44	226.44	iR5G9VJS_75jxjd1Iz8a1	{"vipLevel": "Thành viên Kim Cương", "productName": "1111", "commissionRate": 0.02}	2025-12-19 08:25:11.582	2025-12-19 08:25:12.23	2025-12-19 08:25:31.891
cmjcltcj0000ng4a828yhnt03	cmjccnuf4000111grqchnlj30	cmjccypwr00072yga2tzl7plz	cmjccpi6c000511grix68ifwp	COMPLETED	222.00	0.0200	4.44	226.44	fJXmDxtP-JQq7Q3d5cQoQ	{"vipLevel": "Thành viên Kim Cương", "productName": "1111", "commissionRate": 0.02}	2025-12-19 08:25:09.804	2025-12-19 08:25:10.434	2025-12-19 08:25:32.535
cmjcltaqi000ig4a8tfklpky9	cmjccnuf4000111grqchnlj30	cmjccypwr00072yga2tzl7plz	cmjccpi6c000511grix68ifwp	COMPLETED	222.00	0.0200	4.44	226.44	bOgBHwa0PLX18r2B6RhmY	{"vipLevel": "Thành viên Kim Cương", "productName": "1111", "commissionRate": 0.02}	2025-12-19 08:25:07.483	2025-12-19 08:25:08.384	2025-12-19 08:25:36.454
cmjclt8ty000dg4a887ymnzg6	cmjccnuf4000111grqchnlj30	cmjccypwr00072yga2tzl7plz	cmjccpi6c000511grix68ifwp	COMPLETED	222.00	0.0200	4.44	226.44	kdF69d8M0hYAvlDtCYYFr	{"vipLevel": "Thành viên Kim Cương", "productName": "1111", "commissionRate": 0.02}	2025-12-19 08:25:05.015	2025-12-19 08:25:05.718	2025-12-19 08:25:38.795
cmjclt4x20008g4a8zqqsc9mf	cmjccnuf4000111grqchnlj30	cmjccypwr00072yga2tzl7plz	cmjccpi6c000511grix68ifwp	COMPLETED	222.00	0.0200	4.44	226.44	WdFE9IryCgsfbBXQb7Y0N	{"vipLevel": "Thành viên Kim Cương", "productName": "1111", "commissionRate": 0.02}	2025-12-19 08:24:59.942	2025-12-19 08:25:02.927	2025-12-19 08:25:41.074
\.


--
-- Data for Name: Transaction; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Transaction" (id, "userId", type, amount, status, "referenceId", "idempotencyKey", description, "createdBy", metadata, "balanceBefore", "balanceAfter", "createdAt") FROM stdin;
cmjcco8m5000411gr40sfkuw3	cmjccnuf4000111grqchnlj30	CREDIT	10000.00	POSTED	\N	admin-balance-cmjccnuf4000111grqchnlj30-1766117354908	Admin adjustment: +10000	cmjadzz8q0000e5z846t7agop	\N	0.00	10000.00	2025-12-19 04:09:14.91
cmjcd0xx60004xfhd76m7n1bn	cmjccnuf4000111grqchnlj30	DEBIT	-222.00	POSTED	\N	task-submit-undefined-j4Se3PmFf2vj6rJCXvFeo	Giật đơn: 1111	\N	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcd0wju0001xfhd1yvue85h", "productName": "1111"}	10000.00	9778.00	2025-12-19 04:19:07.579
cmjcd4cj50007xfhd7mi2sg06	cmjccnuf4000111grqchnlj30	REWARD	226.44	POSTED	\N	task-complete-undefined-40Bk9N-Q81aXQkWWUTrvF	Hoàn thành đơn: 1111 (Gốc: $222 + Hoa hồng: $4.44)	cmjccnuf4000111grqchnlj30	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcd0wju0001xfhd1yvue85h", "productName": "1111", "totalRefund": 226.44, "rewardAmount": 4.44, "assignedPrice": 222}	9778.00	10004.44	2025-12-19 04:21:46.482
cmjcdf098000233favse53tem	cmjccnuf4000111grqchnlj30	CREDIT	10000.00	POSTED	\N	admin-balance-cmjccnuf4000111grqchnlj30-1766118603781	Admin adjustment: +10000	cmjccnuf4000111grqchnlj30	\N	10004.44	20004.44	2025-12-19 04:30:03.788
cmjcj09uu000b8hi2zpu5oyo1	cmjccnuf4000111grqchnlj30	DEBIT	-222.00	POSTED	\N	task-submit-undefined-lJjgwBQIxsMYDAZdB8VDA	Giật đơn: 1111	\N	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcj08ea00088hi2f7n85zbp", "productName": "1111"}	20004.44	19782.44	2025-12-19 07:06:34.084
cmjcj0c91000g8hi2nfkgimlc	cmjccnuf4000111grqchnlj30	DEBIT	-222.00	POSTED	\N	task-submit-undefined-aCFpVyQ0u7OvWWyzJwTpE	Giật đơn: 1111	\N	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcj0bk0000d8hi2r8woo2dh", "productName": "1111"}	19782.44	19560.44	2025-12-19 07:06:37.189
cmjcj0ry8000j8hi21y5rsqoc	cmjccnuf4000111grqchnlj30	REWARD	226.44	POSTED	cmjcj0bk0000d8hi2r8woo2dh	task-complete-cmjcj0bk0000d8hi2r8woo2dh-df5zr5tSUQLZDhuVNWmzI	Hoàn thành đơn: 1111 (Gốc: $222 + Hoa hồng: $4.44)	cmjccnuf4000111grqchnlj30	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcj0bk0000d8hi2r8woo2dh", "productName": "1111", "totalRefund": 226.44, "rewardAmount": 4.44, "assignedPrice": 222}	19560.44	19786.88	2025-12-19 07:06:57.536
cmjcj0vc8000m8hi2564wulla	cmjccnuf4000111grqchnlj30	REWARD	226.44	POSTED	cmjcj08ea00088hi2f7n85zbp	task-complete-cmjcj08ea00088hi2f7n85zbp-YipBjEGXV8nEE4yjUs0mw	Hoàn thành đơn: 1111 (Gốc: $222 + Hoa hồng: $4.44)	cmjccnuf4000111grqchnlj30	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcj08ea00088hi2f7n85zbp", "productName": "1111", "totalRefund": 226.44, "rewardAmount": 4.44, "assignedPrice": 222}	19786.88	20013.32	2025-12-19 07:07:01.928
cmjcj3f8q000q8hi2ixlu25g7	cmjcj2h9q000n8hi2uz839nmw	CREDIT	100000.00	POSTED	\N	admin-balance-cmjcj2h9q000n8hi2uz839nmw-1766128141033	Admin adjustment: +100000	cmjccnuf4000111grqchnlj30	\N	0.00	100000.00	2025-12-19 07:09:01.034
cmjclt77l000bg4a8kao36c8i	cmjccnuf4000111grqchnlj30	DEBIT	-222.00	POSTED	\N	task-submit-undefined-BBgekaMqE_x1ICL_RcOh6	Giật đơn: 1111	\N	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjclt4x20008g4a8zqqsc9mf", "productName": "1111"}	20013.32	19791.32	2025-12-19 08:25:02.914
cmjclt9d6000gg4a839xyqk87	cmjccnuf4000111grqchnlj30	DEBIT	-222.00	POSTED	\N	task-submit-undefined--Sz8qJAJVr1gtlIAwF_fq	Giật đơn: 1111	\N	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjclt8ty000dg4a887ymnzg6", "productName": "1111"}	19791.32	19569.32	2025-12-19 08:25:05.706
cmjcltbfg000lg4a883go7nww	cmjccnuf4000111grqchnlj30	DEBIT	-222.00	POSTED	\N	task-submit-undefined-IBqNJbsenoZ9gVgUh9Hj7	Giật đơn: 1111	\N	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcltaqi000ig4a8tfklpky9", "productName": "1111"}	19569.32	19347.32	2025-12-19 08:25:08.38
cmjcltd0d000qg4a8r4mcvgzr	cmjccnuf4000111grqchnlj30	DEBIT	-222.00	POSTED	\N	task-submit-undefined-VPZSYUFGyFmYTFbfuCtx9	Giật đơn: 1111	\N	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcltcj0000ng4a828yhnt03", "productName": "1111"}	19347.32	19125.32	2025-12-19 08:25:10.429
cmjclteea000vg4a8s1z7u1zo	cmjccnuf4000111grqchnlj30	DEBIT	-222.00	POSTED	\N	task-submit-undefined-goD83ql-4nUS48FAhT4kS	Giật đơn: 1111	\N	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcltdwe000sg4a8zelvzylv", "productName": "1111"}	19125.32	18903.32	2025-12-19 08:25:12.226
cmjclttkd000yg4a8at1906xr	cmjccnuf4000111grqchnlj30	REWARD	226.44	POSTED	cmjcltdwe000sg4a8zelvzylv	task-complete-cmjcltdwe000sg4a8zelvzylv-32_TJH9iZcu87R4oqMwrX	Hoàn thành đơn: 1111 (Gốc: $222 + Hoa hồng: $4.44)	cmjccnuf4000111grqchnlj30	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcltdwe000sg4a8zelvzylv", "productName": "1111", "totalRefund": 226.44, "rewardAmount": 4.44, "assignedPrice": 222}	18903.32	19129.76	2025-12-19 08:25:31.885
cmjcltu290011g4a8k4w7v5ug	cmjccnuf4000111grqchnlj30	REWARD	226.44	POSTED	cmjcltcj0000ng4a828yhnt03	task-complete-cmjcltcj0000ng4a828yhnt03-9LcRzt1ao9M3csGZgDDSj	Hoàn thành đơn: 1111 (Gốc: $222 + Hoa hồng: $4.44)	cmjccnuf4000111grqchnlj30	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcltcj0000ng4a828yhnt03", "productName": "1111", "totalRefund": 226.44, "rewardAmount": 4.44, "assignedPrice": 222}	19129.76	19356.20	2025-12-19 08:25:32.529
cmjcltx330014g4a8vzx46er0	cmjccnuf4000111grqchnlj30	REWARD	226.44	POSTED	cmjcltaqi000ig4a8tfklpky9	task-complete-cmjcltaqi000ig4a8tfklpky9-Ux9agO8FQOQQ4SqTiw15e	Hoàn thành đơn: 1111 (Gốc: $222 + Hoa hồng: $4.44)	cmjccnuf4000111grqchnlj30	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjcltaqi000ig4a8tfklpky9", "productName": "1111", "totalRefund": 226.44, "rewardAmount": 4.44, "assignedPrice": 222}	19356.20	19582.64	2025-12-19 08:25:36.448
cmjcltyw80017g4a8whgwhqqi	cmjccnuf4000111grqchnlj30	REWARD	226.44	POSTED	cmjclt8ty000dg4a887ymnzg6	task-complete-cmjclt8ty000dg4a887ymnzg6-39be1jwK6KYj6KhlEhJIv	Hoàn thành đơn: 1111 (Gốc: $222 + Hoa hồng: $4.44)	cmjccnuf4000111grqchnlj30	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjclt8ty000dg4a887ymnzg6", "productName": "1111", "totalRefund": 226.44, "rewardAmount": 4.44, "assignedPrice": 222}	19582.64	19809.08	2025-12-19 08:25:38.792
cmjclu0nj001ag4a8tj1p4fsy	cmjccnuf4000111grqchnlj30	REWARD	226.44	POSTED	cmjclt4x20008g4a8zqqsc9mf	task-complete-cmjclt4x20008g4a8zqqsc9mf-_Cm5WAJ_BXEXT-Dv1N2xx	Hoàn thành đơn: 1111 (Gốc: $222 + Hoa hồng: $4.44)	cmjccnuf4000111grqchnlj30	{"taskId": "cmjccypwr00072yga2tzl7plz", "productId": "cmjccpi6c000511grix68ifwp", "taskRunId": "cmjclt4x20008g4a8zqqsc9mf", "productName": "1111", "totalRefund": 226.44, "rewardAmount": 4.44, "assignedPrice": 222}	19809.08	20035.52	2025-12-19 08:25:41.071
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, username, email, phone, "passwordHash", "withdrawalPinHash", role, status, "inviteCode", "referredBy", balance, "freeSpins", "createdAt", "updatedAt") FROM stdin;
cmjccnuf4000111grqchnlj30	admin	admin@gmail.com	1234567890	$2b$10$1ZiiKjZehFdHYm6EwmfiluHgW34OWDC.ySPxuhaXkiP58Y.Wrbhza	$2b$10$9RKQtQzCFsdRC7SRtEDuXehaguUBKAb.HRKGS4nszza9p5FPmaM9u	ADMIN	ACTIVE	4363154	\N	20035.52	0	2025-12-19 04:08:56.512	2025-12-19 09:01:39.195
cmjcj2h9q000n8hi2uz839nmw	test	fd@gmail.com	12345	$2b$10$gok6KMYGzpqB4H3LSjsNQ.VBmMird3Tn/2hsNGhO/T5YsFRJSkFbK	$2b$10$rClMta1NtI2/eTM5xGe9SOzKX1x3qFkB3CNHRtFbo/d2BA/jop1ze	USER	ACTIVE	1142646	\N	100000.00	0	2025-12-19 07:08:17.006	2025-12-19 07:09:01.029
\.


--
-- Data for Name: VipLevel; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."VipLevel" (id, name, "minBalance", "commissionRate", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
cmjccykx00000ux222rstuutx	Thành viên	0.00	0.0050	t	1	2025-12-19 04:17:17.413	2025-12-19 04:17:17.413
cmjccykxg0001ux226hb4vkje	Thành viên Vàng	1000.00	0.0100	t	2	2025-12-19 04:17:17.428	2025-12-19 04:17:17.428
cmjccykxn0002ux221f8atia7	Thành viên Bạc	5000.00	0.0150	t	3	2025-12-19 04:17:17.435	2025-12-19 04:17:17.435
cmjccykxu0003ux22r6btbzlm	Thành viên Kim Cương	10000.00	0.0200	t	4	2025-12-19 04:17:17.442	2025-12-19 04:17:17.442
\.


--
-- Data for Name: WheelPrize; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WheelPrize" (id, name, description, "imageUrl", "prizeType", value, probability, color, "isActive", "sortOrder", stock, "createdAt", "updatedAt") FROM stdin;
cmjck4jpl000096hu1ia68i50	iphone		/uploads/products/1766129879727-py52tl.jpg	PRODUCT	100.00	0.5000	#4ECDC4	t	1	1	2025-12-19 07:37:53.096	2025-12-19 07:38:01.873
cmjck57qi000196hu8fubcuro	aplle			PRODUCT	200.01	0.5000	#79585f	t	0	1	2025-12-19 07:38:24.233	2025-12-19 07:38:24.233
cmjcmwj14001hg4a8wb4mycbf	1	111		PRODUCT	111.00	0.1000	#4ECDC4	t	11	1	2025-12-19 08:55:37.814	2025-12-19 08:55:37.814
cmjcmwpce001ig4a8q38oh1tj	222	2222		PRODUCT	\N	0.1000	#4ECDC4	t	0	1	2025-12-19 08:55:45.998	2025-12-19 08:55:45.998
cmjcmws5i001jg4a8obb0c8ih	333			PRODUCT	\N	0.1000	#4ECDC4	t	0	1	2025-12-19 08:55:49.638	2025-12-19 08:55:49.638
cmjcmwu9x001kg4a89vj8cwaq	444			PRODUCT	\N	0.1000	#4ECDC4	t	0	1	2025-12-19 08:55:52.39	2025-12-19 08:55:52.39
\.


--
-- Data for Name: WithdrawalRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WithdrawalRequest" (id, "userId", amount, status, "bankName", "bankAccount", "bankAccountName", note, "adminNote", "processedBy", "processedAt", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Name: AdminAuditLog AdminAuditLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY (id);


--
-- Name: ChatMessage ChatMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_pkey" PRIMARY KEY (id);


--
-- Name: DepositRequest DepositRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepositRequest"
    ADD CONSTRAINT "DepositRequest_pkey" PRIMARY KEY (id);


--
-- Name: LuckyWheelSpin LuckyWheelSpin_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LuckyWheelSpin"
    ADD CONSTRAINT "LuckyWheelSpin_pkey" PRIMARY KEY (id);


--
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- Name: ProductPurchase ProductPurchase_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductPurchase"
    ADD CONSTRAINT "ProductPurchase_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: SystemSettings SystemSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SystemSettings"
    ADD CONSTRAINT "SystemSettings_pkey" PRIMARY KEY (id);


--
-- Name: TaskProduct TaskProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskProduct"
    ADD CONSTRAINT "TaskProduct_pkey" PRIMARY KEY (id);


--
-- Name: TaskRun TaskRun_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskRun"
    ADD CONSTRAINT "TaskRun_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: Transaction Transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: VipLevel VipLevel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."VipLevel"
    ADD CONSTRAINT "VipLevel_pkey" PRIMARY KEY (id);


--
-- Name: WheelPrize WheelPrize_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WheelPrize"
    ADD CONSTRAINT "WheelPrize_pkey" PRIMARY KEY (id);


--
-- Name: WithdrawalRequest WithdrawalRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WithdrawalRequest"
    ADD CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY (id);


--
-- Name: AdminAuditLog_adminId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_adminId_idx" ON public."AdminAuditLog" USING btree ("adminId");


--
-- Name: AdminAuditLog_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_createdAt_idx" ON public."AdminAuditLog" USING btree ("createdAt");


--
-- Name: AdminAuditLog_targetUserId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "AdminAuditLog_targetUserId_idx" ON public."AdminAuditLog" USING btree ("targetUserId");


--
-- Name: ChatMessage_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChatMessage_createdAt_idx" ON public."ChatMessage" USING btree ("createdAt");


--
-- Name: ChatMessage_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ChatMessage_userId_idx" ON public."ChatMessage" USING btree ("userId");


--
-- Name: DepositRequest_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DepositRequest_createdAt_idx" ON public."DepositRequest" USING btree ("createdAt");


--
-- Name: DepositRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DepositRequest_status_idx" ON public."DepositRequest" USING btree (status);


--
-- Name: DepositRequest_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "DepositRequest_userId_idx" ON public."DepositRequest" USING btree ("userId");


--
-- Name: LuckyWheelSpin_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LuckyWheelSpin_createdAt_idx" ON public."LuckyWheelSpin" USING btree ("createdAt");


--
-- Name: LuckyWheelSpin_shippingStatus_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LuckyWheelSpin_shippingStatus_idx" ON public."LuckyWheelSpin" USING btree ("shippingStatus");


--
-- Name: LuckyWheelSpin_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LuckyWheelSpin_userId_idx" ON public."LuckyWheelSpin" USING btree ("userId");


--
-- Name: LuckyWheelSpin_wheelPrizeId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "LuckyWheelSpin_wheelPrizeId_idx" ON public."LuckyWheelSpin" USING btree ("wheelPrizeId");


--
-- Name: Notification_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_createdAt_idx" ON public."Notification" USING btree ("createdAt");


--
-- Name: Notification_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_status_idx" ON public."Notification" USING btree (status);


--
-- Name: Notification_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Notification_userId_idx" ON public."Notification" USING btree ("userId");


--
-- Name: ProductPurchase_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductPurchase_createdAt_idx" ON public."ProductPurchase" USING btree ("createdAt");


--
-- Name: ProductPurchase_productId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductPurchase_productId_idx" ON public."ProductPurchase" USING btree ("productId");


--
-- Name: ProductPurchase_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductPurchase_status_idx" ON public."ProductPurchase" USING btree (status);


--
-- Name: ProductPurchase_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ProductPurchase_userId_idx" ON public."ProductPurchase" USING btree ("userId");


--
-- Name: Product_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_createdAt_idx" ON public."Product" USING btree ("createdAt");


--
-- Name: Product_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_sortOrder_idx" ON public."Product" USING btree ("sortOrder");


--
-- Name: Product_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Product_status_idx" ON public."Product" USING btree (status);


--
-- Name: SystemSettings_key_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "SystemSettings_key_idx" ON public."SystemSettings" USING btree (key);


--
-- Name: SystemSettings_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "SystemSettings_key_key" ON public."SystemSettings" USING btree (key);


--
-- Name: TaskProduct_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskProduct_isActive_idx" ON public."TaskProduct" USING btree ("isActive");


--
-- Name: TaskProduct_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskProduct_sortOrder_idx" ON public."TaskProduct" USING btree ("sortOrder");


--
-- Name: TaskProduct_vipLevelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskProduct_vipLevelId_idx" ON public."TaskProduct" USING btree ("vipLevelId");


--
-- Name: TaskRun_idempotencyKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TaskRun_idempotencyKey_key" ON public."TaskRun" USING btree ("idempotencyKey");


--
-- Name: TaskRun_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskRun_state_idx" ON public."TaskRun" USING btree (state);


--
-- Name: TaskRun_taskId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskRun_taskId_idx" ON public."TaskRun" USING btree ("taskId");


--
-- Name: TaskRun_taskProductId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskRun_taskProductId_idx" ON public."TaskRun" USING btree ("taskProductId");


--
-- Name: TaskRun_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "TaskRun_userId_createdAt_idx" ON public."TaskRun" USING btree ("userId", "createdAt");


--
-- Name: Task_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_isActive_idx" ON public."Task" USING btree ("isActive");


--
-- Name: Task_vipLevelId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Task_vipLevelId_idx" ON public."Task" USING btree ("vipLevelId");


--
-- Name: Transaction_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_createdAt_idx" ON public."Transaction" USING btree ("createdAt");


--
-- Name: Transaction_idempotencyKey_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Transaction_idempotencyKey_key" ON public."Transaction" USING btree ("idempotencyKey");


--
-- Name: Transaction_referenceId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_referenceId_idx" ON public."Transaction" USING btree ("referenceId");


--
-- Name: Transaction_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_status_idx" ON public."Transaction" USING btree (status);


--
-- Name: Transaction_type_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_type_idx" ON public."Transaction" USING btree (type);


--
-- Name: Transaction_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transaction_userId_createdAt_idx" ON public."Transaction" USING btree ("userId", "createdAt");


--
-- Name: User_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_createdAt_idx" ON public."User" USING btree ("createdAt");


--
-- Name: User_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_email_idx" ON public."User" USING btree (email);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_inviteCode_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_inviteCode_idx" ON public."User" USING btree ("inviteCode");


--
-- Name: User_inviteCode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_inviteCode_key" ON public."User" USING btree ("inviteCode");


--
-- Name: User_phone_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_phone_idx" ON public."User" USING btree (phone);


--
-- Name: User_phone_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_phone_key" ON public."User" USING btree (phone);


--
-- Name: User_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "User_username_idx" ON public."User" USING btree (username);


--
-- Name: User_username_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_username_key" ON public."User" USING btree (username);


--
-- Name: VipLevel_minBalance_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VipLevel_minBalance_idx" ON public."VipLevel" USING btree ("minBalance");


--
-- Name: VipLevel_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "VipLevel_name_key" ON public."VipLevel" USING btree (name);


--
-- Name: VipLevel_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "VipLevel_sortOrder_idx" ON public."VipLevel" USING btree ("sortOrder");


--
-- Name: WheelPrize_isActive_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WheelPrize_isActive_idx" ON public."WheelPrize" USING btree ("isActive");


--
-- Name: WheelPrize_sortOrder_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WheelPrize_sortOrder_idx" ON public."WheelPrize" USING btree ("sortOrder");


--
-- Name: WithdrawalRequest_createdAt_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WithdrawalRequest_createdAt_idx" ON public."WithdrawalRequest" USING btree ("createdAt");


--
-- Name: WithdrawalRequest_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WithdrawalRequest_status_idx" ON public."WithdrawalRequest" USING btree (status);


--
-- Name: WithdrawalRequest_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WithdrawalRequest_userId_idx" ON public."WithdrawalRequest" USING btree ("userId");


--
-- Name: AdminAuditLog AdminAuditLog_adminId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT "AdminAuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AdminAuditLog AdminAuditLog_targetUserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AdminAuditLog"
    ADD CONSTRAINT "AdminAuditLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ChatMessage ChatMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessage"
    ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DepositRequest DepositRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepositRequest"
    ADD CONSTRAINT "DepositRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LuckyWheelSpin LuckyWheelSpin_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LuckyWheelSpin"
    ADD CONSTRAINT "LuckyWheelSpin_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LuckyWheelSpin LuckyWheelSpin_wheelPrizeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."LuckyWheelSpin"
    ADD CONSTRAINT "LuckyWheelSpin_wheelPrizeId_fkey" FOREIGN KEY ("wheelPrizeId") REFERENCES public."WheelPrize"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Notification Notification_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductPurchase ProductPurchase_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductPurchase"
    ADD CONSTRAINT "ProductPurchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProductPurchase ProductPurchase_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProductPurchase"
    ADD CONSTRAINT "ProductPurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskProduct TaskProduct_vipLevelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskProduct"
    ADD CONSTRAINT "TaskProduct_vipLevelId_fkey" FOREIGN KEY ("vipLevelId") REFERENCES public."VipLevel"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TaskRun TaskRun_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskRun"
    ADD CONSTRAINT "TaskRun_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskRun TaskRun_taskProductId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskRun"
    ADD CONSTRAINT "TaskRun_taskProductId_fkey" FOREIGN KEY ("taskProductId") REFERENCES public."TaskProduct"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TaskRun TaskRun_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskRun"
    ADD CONSTRAINT "TaskRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Task Task_vipLevelId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_vipLevelId_fkey" FOREIGN KEY ("vipLevelId") REFERENCES public."VipLevel"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Transaction Transaction_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transaction"
    ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WithdrawalRequest WithdrawalRequest_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WithdrawalRequest"
    ADD CONSTRAINT "WithdrawalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict EAxVSOfQ9JRq8T6xY6ccq3NJLarzsGfRknZWKtuA6bLqg9Ws8GUOzwA7HibFQ3U

