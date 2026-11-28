CREATE TABLE request_votes (
    request_id BIGINT NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (request_id, user_id)
);
CREATE INDEX request_votes_user_id_idx ON request_votes (user_id);
