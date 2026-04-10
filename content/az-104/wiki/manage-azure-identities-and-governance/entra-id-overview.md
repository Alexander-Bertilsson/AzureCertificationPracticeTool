---
slug: entra-id-overview
title: Microsoft Entra ID Overview
topic: manage-azure-identities-and-governance
summary: A short orientation to Microsoft Entra ID (formerly Azure Active Directory) — what it is, what it manages, and where it fits in an Azure subscription.
sourceUrl: https://learn.microsoft.com/en-us/entra/fundamentals/whatis
tags:
  - identity
  - entra-id
readingTimeMinutes: 4
---

# Microsoft Entra ID Overview

> **Placeholder content.** This article will be replaced by scraped content from Microsoft Learn in phase 2.

Microsoft Entra ID (formerly Azure Active Directory) is Microsoft's cloud-based identity and access management service. Every Azure subscription is associated with exactly one Entra ID tenant, and that tenant is what authenticates users, groups, and service principals when they try to do anything with Azure resources.

## What Entra ID manages

- **Users** — human accounts, either created directly in Entra ID, synced from an on-premises Active Directory via Entra Connect, or federated from another identity provider.
- **Groups** — collections of users (and other groups) used to grant access at scale instead of one user at a time.
- **Service principals** — non-human identities that applications and services use to authenticate to Azure.
- **Devices** — joined or registered devices that can be evaluated for conditional access decisions.

## Tenant vs. subscription

A common point of confusion: a **tenant** is the directory of identities, while a **subscription** is the billing/resource boundary. One tenant can have many subscriptions, but each subscription belongs to exactly one tenant. When you grant someone "Owner on the subscription," you're using Entra ID's directory of users to make a role assignment scoped to that subscription.

## Why this matters for AZ-104

The AZ-104 exam expects you to know how to create users and groups, assign built-in and custom RBAC roles, troubleshoot sign-ins from the Entra ID admin center, and use Conditional Access policies to enforce MFA or block legacy authentication.
