# Database Design

## Users
- name
- email
- password
- role

## Elections
- title
- description
- startDate
- endDate
- status

## Candidates
- name
- electionId
- department
- manifesto

## Votes
- userId
- electionId
- candidateId
- votedAt