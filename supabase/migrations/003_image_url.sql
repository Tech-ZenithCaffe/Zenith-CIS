-- ================================================================
-- Migration: 003_image_url
-- ================================================================
-- Descrição: Adiciona suporte para geração de imagens nas ideias
-- ================================================================

ALTER TABLE content_packages
ADD COLUMN image_url TEXT;

COMMENT ON COLUMN content_packages.image_url IS 'URL da imagem gerada por IA para a ideia';
