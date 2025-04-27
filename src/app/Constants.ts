export enum TestStatus {
    Draft = 'DRAFT',
    SetupInProgress = 'SETUP_IN_PROGRESS',
    Active = 'ACTIVE',
    Closed = 'CLOSED'
}

export enum TestCategories {
    General = 'GENERAL',
    Technical = 'TECHNICAL',
    Behavioral = 'BEHAVIORAL',
    SoftSkills = 'SOFT_SKILLS',
    Programming = 'PROGRAMMING',
    Database = 'DATABASE',
    Networking = 'NETWORKING',
}

export enum TestResponseStatus {
    Pending = 'PENDING',
    InProgress = 'IN_PROGRESS',
    Submitted = 'SUBMITTED',
    Paused = 'PAUSED',
}