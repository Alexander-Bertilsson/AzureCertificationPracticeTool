---
slug: storage-accounts-overview
title: Azure Storage Accounts Overview
topic: implement-and-manage-storage
summary: What an Azure Storage account is, the four data services it hosts, redundancy options, and how access is controlled.
sourceUrl: https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview
tags:
  - storage
  - storage-account
readingTimeMinutes: 5
---

# Azure Storage Accounts Overview

> **Placeholder content.** This article will be replaced by scraped content from Microsoft Learn in phase 2.

An **Azure Storage account** is a top-level container that holds all of your Azure Storage data objects. It exposes a globally unique namespace (`<account-name>.blob.core.windows.net`, etc.) and is the unit at which you configure performance tier, redundancy, and most security settings.

## The four data services

Every general-purpose v2 storage account hosts four services, each with its own endpoint:

| Service | Endpoint suffix          | Use case                                                 |
| ------- | ------------------------ | -------------------------------------------------------- |
| Blob    | `blob.core.windows.net`  | Unstructured object storage (images, video, backups)     |
| File    | `file.core.windows.net`  | Fully managed SMB / NFS file shares                      |
| Queue   | `queue.core.windows.net` | Lightweight messaging between application components     |
| Table   | `table.core.windows.net` | NoSQL key/value store for structured non-relational data |

## Redundancy options

Pick redundancy at account creation time. The trade-off is durability vs. cost:

- **LRS** (Locally redundant) — three copies in one datacenter. Cheapest. Survives disk failure but not a datacenter outage.
- **ZRS** (Zone redundant) — three copies across three availability zones in the same region. Survives a zone outage.
- **GRS / RA-GRS** (Geo redundant) — LRS in the primary region plus async replication to a paired secondary region. RA-GRS adds read-only access to the secondary.
- **GZRS / RA-GZRS** — same idea but the primary copies are zone-redundant.

## Access control

You can authorize access to storage in three ways, in order of preference:

1. **Microsoft Entra ID** — RBAC role assignments on the storage account or container.
2. **Shared Access Signatures (SAS)** — time-bound, scoped tokens generated from one of the storage account keys.
3. **Account keys** — full-control symmetric keys. Powerful but dangerous; rotate regularly.
