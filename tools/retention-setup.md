# Data retention setup (owner steps)

The site code stamps `expireAt` on personal-data documents:
- requests (unpaid): now + 90 days; on payment: now + 8 years
- progress: now + 2 years, refreshed on every save
- items, mocks, access: never stamped (paid content and grants)

Firestore only deletes when a TTL policy is on. One time, per collection:

    gcloud firestore fields ttls update expireAt --collection-group=requests --enable-ttl --project=pharmacheme-1f559
    gcloud firestore fields ttls update expireAt --collection-group=progress --enable-ttl --project=pharmacheme-1f559

(or Firebase console > Firestore > Indexes > TTL > Add policy). Deletion runs within about 24 hours of expiry.

Also check firestore.rules allow the `expireAt` field on requests and progress writes.
Documents created before this change have no expireAt and are not deleted until backfilled.
Formspree and Google Sheets copies of enquiries need clearing by hand in their own dashboards.
