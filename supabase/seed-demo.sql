-- Run after creating a user and company if you want demo rows.
-- Replace COMPANY_ID with your company id.
insert into public.projects(company_id,name,address,client_name,status,start_date,forecast_completion,budget)
values ('COMPANY_ID','Harbour Apartments','Sydney NSW','Demo Client','active',current_date - interval '60 days', current_date + interval '77 days', 1800000);
