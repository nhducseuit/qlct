-- Custom backfill SQL for Family migration

-- Insert Families
INSERT INTO public."Family"
(id, "name", "createdAt", "updatedAt", "parentId")
VALUES('big-family-1', 'Nhà chung', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public."Family"
(id, "name", "createdAt", "updatedAt", "parentId")
VALUES('small-family-1', '2vc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, NULL)
ON CONFLICT (id) DO NOTHING;

-- Assign categories to families
UPDATE "Category"
SET "familyId" = 'small-family-1'
WHERE "id" IN (
  '76528a8a-a82a-4ef0-87aa-256ac621b43b',
  '5ae9865d-4041-4612-a757-8730161071c7',
  '87ae0b88-d46c-42fe-965c-6813268e44d1',
  '182fe1c6-5b87-4468-93ba-159e01146b3d',
  '270c1489-c0a3-457d-b778-59e222880073',
  '5d271e51-1c6b-4919-b76e-d7a59e719b22',
  'f35b2279-c7d3-4ff6-b867-b79955b5227e',
  '714920cc-22c9-4e14-a8cd-88d488ffeb58'
);
UPDATE "Category"
SET "familyId" = 'big-family-1'
WHERE "familyId" IS NULL;

INSERT INTO public."User" (id, email, password, "familyId", "createdAt", "updatedAt")
VALUES (
  '2e5841b9-518c-4eb6-89fa-7bbf117b546d',
  'user@example.com',
  'hashedpassword', -- or whatever hash you use
  'small-family-1',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;

-- Assign all household members to big-family-1
UPDATE public."HouseholdMember"
SET "familyId"='big-family-1';

-- Insert specific household members for small-family-1
INSERT INTO public."HouseholdMember"
(id, "name", "isActive", "order", "createdAt", "updatedAt", "userId", "familyId")
VALUES('6e90d131-e1cc-4355-9030-505ee6ca7e96', 'Vợ', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '2e5841b9-518c-4eb6-89fa-7bbf117b546d', 'small-family-1')
ON CONFLICT (id) DO NOTHING;
INSERT INTO public."HouseholdMember"
(id, "name", "isActive", "order", "createdAt", "updatedAt", "userId", "familyId")
VALUES('061731f1-7857-4055-aa8d-f0f4bdc1fff1', 'Chồng', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '2e5841b9-518c-4eb6-89fa-7bbf117b546d', 'small-family-1')
ON CONFLICT (id) DO NOTHING;

-- PredefinedSplitRatio
UPDATE public."PredefinedSplitRatio"
SET "familyId"='small-family-1'
WHERE id='b3396d63-7620-40fa-999a-5a6323069d24';
UPDATE public."PredefinedSplitRatio"
SET "familyId"='big-family-1'
WHERE "familyId" is null;

-- Transactions
update public."Transaction"
set "familyId"='big-family-1'
where "splitRatio" = '[{"memberId": "16e9f4a9-2cc9-4c42-b0df-445a3a48ad44", "percentage": 50}, {"memberId": "910b287d-d365-4daa-83d5-11c096b07068", "percentage": 25}, {"memberId": "94e6e8bf-3a8a-4234-a07c-28c54c1a06e6", "percentage": 25}]';

update public."Transaction"
set "familyId"='small-family-1'
where "categoryId" in ('76528a8a-a82a-4ef0-87aa-256ac621b43b'
,'5ae9865d-4041-4612-a757-8730161071c7'
,'87ae0b88-d46c-42fe-965c-6813268e44d1'
,'182fe1c6-5b87-4468-93ba-159e01146b3d'
,'270c1489-c0a3-457d-b778-59e222880073'
,'5d271e51-1c6b-4919-b76e-d7a59e719b22'
,'f35b2279-c7d3-4ff6-b867-b79955b5227e'
,'714920cc-22c9-4e14-a8cd-88d488ffeb58');

update public."Transaction"
set "familyId"='big-family-1'
where exists(
	select 1
	from jsonb_array_elements("splitRatio") elem
	where elem->>'memberId' IN ('94e6e8bf-3a8a-4234-a07c-28c54c1a06e6','16e9f4a9-2cc9-4c42-b0df-445a3a48ad44')
);

update public."Transaction"
set "familyId"='small-family-1'
where "familyId" is null;

-- Users
update public."User"
set "familyId"='small-family-1'
where id='d848cfca-b85c-41cb-b9c7-d8321ff7346f';

update public."User"
set "familyId"='big-family-1'
where "familyId" is null;
