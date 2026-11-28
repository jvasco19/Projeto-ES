CREATE TABLE sprints (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    goal TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date),
    UNIQUE (product_id, name)
);
CREATE INDEX sprints_product_id_idx ON sprints (product_id);

ALTER TABLE features ADD COLUMN sprint_id BIGINT REFERENCES sprints(id) ON DELETE SET NULL;
CREATE INDEX features_sprint_id_idx ON features (sprint_id);