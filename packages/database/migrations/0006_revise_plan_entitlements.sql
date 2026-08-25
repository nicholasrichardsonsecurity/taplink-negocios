UPDATE "billing_plans" SET "limits_json" = '{"locations":1,"users":2,"analyticsDays":30,"csv":false,"ai":false,"support":"standard"}', "updated_at" = now() WHERE "code" = 'essencial';
UPDATE "billing_plans" SET "limits_json" = '{"locations":3,"users":5,"analyticsDays":90,"csv":true,"ai":false,"support":"priority"}', "updated_at" = now() WHERE "code" = 'negocios';
UPDATE "billing_plans" SET "limits_json" = '{"locations":10,"users":10,"analyticsDays":90,"csv":true,"ai":true,"support":"priority"}', "updated_at" = now() WHERE "code" = 'premium';
