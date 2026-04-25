import type { CandidateListResponseDto } from "@closed-ai/types";

import { toCandidateSummaryDto } from "../../lib/formatters.js";
import { candidateRepository } from "../../repositories/recruiting/candidate.repository.js";

export const candidateService = {
  async listCandidates(): Promise<CandidateListResponseDto> {
    const candidates = await candidateRepository.listForRecruiter();

    return {
      items: candidates.map((candidate) => toCandidateSummaryDto(candidate)),
      total: candidates.length,
    };
  },
};
