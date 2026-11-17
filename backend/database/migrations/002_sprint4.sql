CREATE TYPE feature_status AS ENUM(
    'todo',
    'in_progress',
    'in_review',
    'done'
);

CREATE TYPE release_status AS ENUM(
    'planned',
    'in_progress',
    'done'
);

CREATE TYPE request_category AS ENUM(
    'reports',
    'integrations',
    'notifications',
    'usability',
    'performance',
    'security'
);

CREATE TYPE request_status AS ENUM(
    'submitted',
    'in_review',
    'approved',
    'planned',
    'delivered',
    'rejected'
);

CREATE TYPE story_state AS ENUM(
    'draft',
    'confirmed'
);


CREATE TABLE teams (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 0 CHECK (capacity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, name)
);

ALTER TABLE product_members
    ADD COLUMN team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    ADD CONSTRAINT product_members_team_role_check
        CHECK (team_id IS NULL OR role <> 'customer');

CREATE INDEX product_members_team_id_idx ON product_members (team_id);


CREATE TABLE milestones (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, name)
);


CREATE TABLE releases (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    milestone_id BIGINT REFERENCES milestones(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    objective TEXT,
    start_date DATE,
    end_date DATE,
    status release_status NOT NULL DEFAULT 'planned', 
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(product_id, name)
);
CREATE INDEX releases_milestone_id_idx ON releases (milestone_id);

CREATE TABLE feature_requests (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    current_workflow TEXT,
    impact TEXT,
    importance SMALLINT CHECK (importance BETWEEN 1 AND 5),
    category request_category,
    status request_status NOT NULL DEFAULT 'submitted',
    rejection_reason TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (status <> 'rejected' OR rejection_reason IS NOT NULL)
);
CREATE INDEX feature_requests_product_status_idx ON feature_requests (product_id, status);
CREATE INDEX feature_requests_author_id_idx ON feature_requests (author_id);

CREATE TABLE request_status_changes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    from_status request_status,
    to_status request_status NOT NULL,
    changed_by BIGINT NOT NULL REFERENCES users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX request_status_changes_request_idx ON request_status_changes (request_id, changed_at);

CREATE TABLE attachments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    uploaded_by BIGINT NOT NULL REFERENCES users(id),
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL CHECK (size_bytes BETWEEN 1 AND 5242880),
    storage_path TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX attachments_request_id_idx ON attachments (request_id);

CREATE TABLE request_versions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    request_id BIGINT NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL CHECK (version_number >= 1),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    edited_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (request_id, version_number)
);

CREATE TABLE tags (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE (product_id, name)
);

CREATE TABLE request_tags (
    request_id BIGINT NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (request_id, tag_id)
);
CREATE INDEX request_tags_tag_id_idx ON request_tags (tag_id);

CREATE TABLE features (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    request_id BIGINT REFERENCES feature_requests(id) ON DELETE SET NULL,
    team_id BIGINT REFERENCES teams(id) ON DELETE SET NULL,
    assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    release_id BIGINT REFERENCES releases(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    status feature_status NOT NULL DEFAULT 'todo',
    impact SMALLINT CHECK (impact BETWEEN 1 AND 10),
    effort SMALLINT CHECK (effort BETWEEN 1 AND 10),
    priority SMALLINT GENERATED ALWAYS AS (ROUND(impact * 10.0 / effort)::SMALLINT) STORED,
    story_points SMALLINT CHECK (story_points IN (1, 2, 3, 5, 8, 13, 21, 34)),
    backlog_position INTEGER,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (end_date >= start_date),
    UNIQUE(request_id)
);
CREATE INDEX features_product_priority_idx ON features (product_id, priority DESC);
CREATE INDEX features_team_id_idx ON features (team_id);
CREATE INDEX features_assignee_id_idx ON features (assignee_id);
CREATE INDEX features_release_id_idx ON features (release_id);

CREATE TABLE feature_status_changes (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feature_id BIGINT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    from_status feature_status,
    to_status feature_status NOT NULL,
    changed_by BIGINT NOT NULL REFERENCES users(id),
    changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX feature_status_changes_feature_idx ON feature_status_changes (feature_id, changed_at);

CREATE TABLE user_stories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    feature_id BIGINT NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    goal TEXT NOT NULL,
    benefit TEXT NOT NULL,
    state story_state NOT NULL DEFAULT 'confirmed',
    ai_generated BOOLEAN NOT NULL DEFAULT false,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(feature_id) 
);


CREATE TABLE acceptance_criteria (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    story_id BIGINT NOT NULL REFERENCES user_stories(id) ON DELETE CASCADE,
    position SMALLINT NOT NULL DEFAULT 1 CHECK (position >= 1),
    text TEXT NOT NULL,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(story_id, position)
);
