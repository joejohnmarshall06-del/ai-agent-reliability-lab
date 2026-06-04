# Retrieval Augmented Generation

Retrieval augmented generation improves answer grounding by adding relevant knowledge base chunks to the model context. The retrieval layer should be evaluated with recall at k, citation coverage, and failure analysis.

RAG can still fail when documents are stale, chunks are poorly sized, queries are ambiguous, or the answer synthesis step ignores retrieved evidence. Production systems should record traces for retrieval results and final responses.

