import type { RichTextDoc } from "@/db/json";

export const OPPORTUNITY_ARTICLES: Record<string, RichTextDoc> = {
  "faculty-research-grant": {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Grant Overview and Objectives" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The Faculty of Computing Undergraduate Research Grant supports ambitious student-led investigation into real-world computing systems, algorithmic optimization, localized data models, and embedded computing solutions. Supported by alumni contributions and academic partnerships, this grant provides direct laboratory funding, cloud compute credits, and faculty mentorship to qualifying student researchers.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Selected recipients conduct supervised research over a six-month period within the Faculty of Computing complex at the University of Uyo. Project deliverables include working software artifacts, open-source repositories, and formal technical papers prepared for departmental presentation and conference publication.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Key Focus Areas" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Localized Artificial Intelligence: Natural language processing for regional languages, agricultural vision models, and low-resource edge inference.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Wireless and Distributed Systems: Mesh networking, campus telemetry, and fault-tolerant sensor networks tailored for unstable grid environments.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Cybersecurity and Systems Resilience: Practical vulnerability auditing, cryptographic authentication protocols, and institutional fraud prevention.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Public Sector Information Systems: Scalable civil registration archives, medical health records, and transparent digital voting mechanisms.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Eligibility Criteria" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Applicants must be enrolled full-time in any department under the Faculty of Computing (Computer Science, Cybersecurity, Information Systems, Software Engineering, or Data Science) at the University of Uyo. Candidates should be in their 300 level or 400 level of study, maintain a minimum cumulative grade point average of 3.5, and submit an endorsed research concept proposal co-signed by an academic supervisor.",
          },
        ],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Priority is given to practical engineering proposals that directly address infrastructural or administrative challenges within the university and surrounding communities.",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Submission and Review Workflow" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "All applications must be submitted directly to the office of the Faculty Research Committee or emailed in PDF format to research@computing.uniuyo.edu.ng. Submissions must include a 3-page project synopsis, itemized budget breakdown, student curriculum vitae, and a formal recommendation letter from your department head or project coordinator. The review committee evaluates proposals on technical merit, feasibility, and community impact.",
          },
        ],
      },
    ],
  },
  "hackathon-sponsorship": {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Sponsorship and Mentorship Programme" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "The Uyo Tech Collective Hackathon Sponsorship supports computing students representing the University of Uyo in national, regional, and international collegiate hackathons. Winning competitions requires reliable connectivity, hardware kits, transit logistics, and expert technical guidance. This sponsorship provides both monetary stipends and industry mentorship to qualified student teams.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Beyond direct logistical assistance, sponsored teams are paired with experienced senior software engineers, system architects, and startup founders from Akwa Ibom and the wider Nigerian tech ecosystem for intensive design critique and pitch rehearsals.",
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "What the Sponsorship Covers" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Logistics and Travel: Inter-city transportation, accommodation, and daily stipends for verified on-site hackathon delegations.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Hardware Components: Specialized micro-controllers, sensors, 3D printing access, and test benches required for physical prototypes.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Cloud Resources: High-performance cloud instances, API access keys, and domain provisioning for production deployments.",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Advisory Sessions: Pitch coaching, architecture reviews, and mock question sessions with working engineering directors.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Application Process" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Teams must consist of two to four matriculated students from the Faculty of Computing. Applications should be submitted at least three weeks prior to the hackathon registration deadline. Interested teams should prepare their team roster, Github portfolio links, competition overview, and a brief description of the technical challenge they plan to tackle.",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Inquiries and team portfolios should be routed through the NACOS UNIUYO Software and Innovation Directorate, or delivered in person during designated office hours at the Student Council Chambers.",
          },
        ],
      },
    ],
  },
};
